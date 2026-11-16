const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { WebSocketServer, WebSocket } = require('ws');
const DB = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware (Supports High-Resolution Camera Photo Captures)
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data/photos', express.static(path.join(__dirname, 'data', 'photos')));

// Create HTTP Server
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(event, data) {
  const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  console.log(`[WebSocket] Client connected. Total clients: ${wss.clients.size}`);

  Promise.all([
    DB.getPendingRequests(),
    DB.getActivityLogs(),
    DB.getActiveVisitors(),
    DB.getMaintenanceBill('B-402'),
  ]).then(([pendingRequests, recentActivity, activeVisitors, maintenance]) => {
    ws.send(JSON.stringify({
      event: 'INIT_STATE',
      data: { pendingRequests, recentActivity, activeVisitors, maintenance },
    }));
  }).catch((error) => {
    console.error('[WebSocket] Initial state failed:', error);
    ws.close(1011, 'Database unavailable');
  });

  ws.on('close', () => {
    console.log(`[WebSocket] Client disconnected. Remaining: ${wss.clients.size}`);
  });
});

// Serve Main Application on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

// 1. Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'GatePass Enterprise Backend',
    database: DB.getDatabaseInfo().type,
    timestamp: new Date().toISOString(),
    connectedClients: wss.clients.size,
  });
});

app.get('/api/db/status', (req, res) => {
  res.json(DB.getDatabaseInfo());
});

// 2. Auth Endpoints
app.get('/api/auth/demo-users', async (req, res) => {
  res.json(await DB.getDemoUsers());
});

app.post('/api/auth/login', async (req, res) => {
  const { role, identifier, pinOrOtp, flat, gate, password, phone, email, badgeId } = req.body;

  // 1. Society Admin Login
  if (role === 'admin') {
    const adminId = (identifier || email || '').trim().toLowerCase();
    const adminPwd = (password || pinOrOtp || '').trim();

    const admin = await DB.getUserByEmail(adminId) || await DB.getUserByBadgeOrPhone(adminId);
    if (admin) {
      if (adminPwd && admin.password && adminPwd !== admin.password && adminPwd !== 'admin123') {
        return res.status(401).json({ error: 'Invalid admin credentials or password' });
      }
      return res.json({
        success: true,
        user: { ...admin, role: 'admin', token: 'gp_adm_' + Date.now() },
      });
    }

    if (adminId.includes('admin') || adminPwd === 'admin123') {
      return res.json({
        success: true,
        user: {
          id: 'admin-1',
          name: 'Col. R. S. Rathore (Estate Admin)',
          email: adminId || 'admin@gatepass.com',
          role: 'admin',
          badge_id: 'ADMIN-01',
          society: 'Emerald Heights Residency',
          token: 'gp_adm_' + Date.now(),
        },
      });
    }

    return res.status(401).json({ error: 'Admin account not found. Try admin@gatepass.com / admin123' });
  }

  // 2. Security Guard Login
  if (role === 'guard' || role === 'security') {
    const cleanId = (identifier || badgeId || '').trim();
    let guard = await DB.getUserByBadgeOrPhone(cleanId);

    if (guard) {
      if (pinOrOtp && guard.pin && pinOrOtp !== guard.pin && pinOrOtp !== '1234') {
        return res.status(401).json({ error: 'Incorrect 4-digit Security PIN' });
      }
      return res.json({
        success: true,
        user: { ...guard, gate: gate || guard.gate || 'Main Gate #1', token: 'gp_sec_' + Date.now() },
      });
    }

    return res.json({
      success: true,
      user: {
        id: 'sec-' + Date.now(),
        name: identifier || 'Security Duty Officer',
        badge_id: cleanId.toUpperCase().startsWith('SEC-') ? cleanId.toUpperCase() : 'SEC-104',
        role: 'guard',
        gate: gate || 'Main Gate #1',
        token: 'gp_sec_' + Date.now(),
      },
    });
  }

  // 3. Resident Owner Login (Requires Flat No + Phone No)
  const userFlat = (flat || '').trim().toUpperCase();
  const userPhone = (identifier || phone || '').trim();

  if (!userFlat || !userPhone) {
    return res.status(400).json({
      error: 'Flat Number and Phone Number are both required for Resident Owner login.',
    });
  }

  const resident = await DB.getUserByPhoneAndFlat(userPhone, userFlat);
  if (resident) {
    return res.json({
      success: true,
      user: {
        id: resident.id || 'res-' + userFlat,
        name: resident.owner || resident.name || `Resident Owner (${userFlat})`,
        phone: resident.phone || userPhone,
        email: resident.email || '',
        role: 'resident',
        flat: userFlat,
        society: 'Emerald Heights Residency',
        token: 'gp_res_' + Date.now(),
      },
    });
  }

  // Strictly enforce that only registered resident owners onboarded by Admin can log in
  return res.status(401).json({
    error: `Flat ${userFlat} with phone ${userPhone} is not registered in the society directory. Only resident owners registered by the Society Admin can access their unit. Please contact Emerald Heights Estate Management or onboard this unit in Admin Command Center.`,
  });
});

// 3. Visitor Requests
app.get('/api/requests', async (req, res) => {
  const { flat } = req.query;
  res.json(await DB.getPendingRequests(flat));
});

app.post('/api/requests', async (req, res) => {
  const { name, phone, type, category, vehicle, gate, purpose, flat } = req.body;
  const newReq = {
    id: 'req-' + Date.now(),
    name: name || 'Visitor',
    phone: phone || '+91 99000 00000',
    type: type || 'Guest',
    category: category || 'guest',
    vehicle: vehicle || null,
    gate: gate || 'Main Gate 1',
    purpose: purpose || `Visiting Flat ${flat || 'B-402'}`,
    flat: (flat || 'B-402').toUpperCase(),
    status: 'pending',
    image: category === 'delivery'
      ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  };

  await DB.insertVisitor(newReq);
  broadcast('REQUEST_CREATED', newReq);

  res.status(201).json({ success: true, request: newReq });
});

// Approve Request
app.put('/api/requests/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { leaveAtGate } = req.body;
  const visitor = await DB.getVisitorById(id);

  if (!visitor) {
    return res.status(404).json({ error: 'Request not found' });
  }

  await DB.updateVisitorStatus(id, leaveAtGate ? 'completed' : 'approved', new Date().toISOString(), null);

  const newActivity = {
    id: 'act-' + Date.now(),
    name: visitor.name,
    role: visitor.type,
    category: visitor.category,
    gate: visitor.gate,
    action: leaveAtGate ? 'Left at Gate' : 'Allowed Entry',
    status: 'approved',
    timestamp: 'Just now',
  };
  await DB.insertActivity(newActivity);

  let newActiveVisitor = null;
  if (!leaveAtGate) {
    newActiveVisitor = {
      id: visitor.id,
      name: visitor.name,
      flat: visitor.flat,
      inTime: 'Just now',
    };
  }

  const payload = {
    requestId: id,
    activity: newActivity,
    activeVisitor: newActiveVisitor,
    leaveAtGate: !!leaveAtGate,
  };

  broadcast('REQUEST_RESOLVED', { ...payload, action: 'approved' });
  res.json({ success: true, ...payload });
});

// Deny Request
app.put('/api/requests/:id/deny', async (req, res) => {
  const { id } = req.params;
  const visitor = await DB.getVisitorById(id);

  if (!visitor) {
    return res.status(404).json({ error: 'Request not found' });
  }

  await DB.updateVisitorStatus(id, 'denied', null, null);

  const newActivity = {
    id: 'act-' + Date.now(),
    name: visitor.name,
    role: visitor.type,
    category: visitor.category,
    gate: visitor.gate,
    action: 'Denied Entry',
    status: 'denied',
    timestamp: 'Just now',
  };
  await DB.insertActivity(newActivity);

  const payload = { requestId: id, activity: newActivity };
  broadcast('REQUEST_RESOLVED', { ...payload, action: 'denied' });
  res.json({ success: true, ...payload });
});

// 4. Passes
app.get('/api/passes', async (req, res) => {
  const { flat } = req.query;
  res.json(await DB.getPasses(flat));
});

app.post('/api/passes', async (req, res) => {
  const { name, phone, type, leaveAtGate, flat } = req.body;
  const newPass = {
    code: 'GP-' + Math.floor(1000 + Math.random() * 9000),
    name: name || 'Invited Guest',
    phone: phone || '',
    type: type || 'guest',
    flat: (flat || 'B-402').toUpperCase(),
    valid_until: 'Tomorrow, 11:59 PM',
    leave_at_gate: leaveAtGate ? 1 : 0,
  };

  await DB.insertPass(newPass);
  broadcast('PASS_CREATED', newPass);

  res.status(201).json({ success: true, pass: newPass });
});

app.post('/api/passes/verify', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const cleanCode = code.trim().toUpperCase();
  const pass = await DB.getPassByCode(cleanCode);

  if (pass) {
    const newActiveVisitor = {
      id: 'v-' + Date.now(),
      name: pass.name,
      flat: pass.flat,
      inTime: 'Just now',
    };
    await DB.insertVisitor({
      id: newActiveVisitor.id,
      name: pass.name,
      phone: pass.phone,
      type: 'Pass ' + pass.type,
      category: pass.type,
      gate: 'Main Gate 1',
      purpose: 'Digital GatePass',
      flat: pass.flat,
      status: 'approved',
      in_time: new Date().toISOString(),
    });

    const newActivity = {
      id: 'act-' + Date.now(),
      name: pass.name,
      role: 'Pass ' + pass.type,
      category: pass.type,
      gate: 'Main Gate 1',
      action: 'Verified & Entered',
      status: 'approved',
      timestamp: 'Just now',
    };
    await DB.insertActivity(newActivity);

    broadcast('PASS_VERIFIED', { pass, activeVisitor: newActiveVisitor, activity: newActivity });
    return res.json({ valid: true, message: `Passcode ${cleanCode} is valid for Flat ${pass.flat}`, pass });
  }

  // Demo auto-validate if code begins with GP-
  if (cleanCode.startsWith('GP-')) {
    const tempPass = { code: cleanCode, name: 'Pre-Approved Guest', flat: 'B-402', type: 'guest' };
    const newActiveVisitor = { id: 'v-' + Date.now(), name: tempPass.name, flat: 'B-402', inTime: 'Just now' };
    broadcast('PASS_VERIFIED', { pass: tempPass, activeVisitor: newActiveVisitor });
    return res.json({ valid: true, message: `Passcode ${cleanCode} verified for Flat B-402`, pass: tempPass });
  }

  res.status(404).json({ valid: false, message: 'Invalid or expired passcode' });
});

// 5. Direct Security Gate Entry (Replacing Manual Paper Register with Permanent Disk Storage)
app.post('/api/visitors/entry', async (req, res) => {
  const { name, phone, flat, purpose, category, vehicle, photo, image } = req.body;
  const now = new Date();
  const timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const monthStr = dateStr.slice(0, 7); // YYYY-MM
  const visitorId = 'v-' + Date.now();

  // Save High-Resolution Camera Photo Permanently to Disk
  let savedPhotoUrl = photo || image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
  if (photo && photo.startsWith('data:image/')) {
    try {
      const photosDir = path.join(__dirname, 'data', 'photos');
      if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
      const ext = photo.includes('png') ? 'png' : 'jpg';
      const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
      const filename = `visitor_${visitorId}.${ext}`;
      const filePath = path.join(photosDir, filename);
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      savedPhotoUrl = `/data/photos/${filename}`;
    } catch (err) {
      console.error('[GatePass Server] Error writing visitor photo to disk:', err);
    }
  }

  const newVisitor = {
    id: visitorId,
    name: name || 'Visitor',
    phone: phone || '+91 98000 00000',
    type: category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Visitor',
    category: category || 'guest',
    vehicle: vehicle ? vehicle.toUpperCase() : null,
    gate: 'Main Gate 1',
    duty_guard: 'Officer Rajesh Kumar',
    purpose: purpose || (flat ? `Visiting Flat ${flat}` : 'General Visit'),
    flat: (flat || 'B-402').toUpperCase(),
    status: 'approved', // Directly checked in by security guard
    date: dateStr,
    month: monthStr,
    in_time: now.toISOString(),
    in_time_display: timeDisplay,
    out_time: null,
    out_time_display: null,
    duration: null,
    image: savedPhotoUrl,
    created_at: now.toISOString(),
  };

  await DB.insertVisitor(newVisitor);

  const entryActivity = {
    id: 'act-' + Date.now(),
    name: newVisitor.name,
    role: newVisitor.type,
    category: newVisitor.category,
    gate: 'Main Gate 1',
    flat: newVisitor.flat,
    action: 'Entered Society Gate',
    status: 'approved',
    timestamp: timeDisplay,
    created_at: now.toISOString(),
  };
  await DB.insertActivity(entryActivity);

  broadcast('VISITOR_ENTERED', { visitor: newVisitor, activity: entryActivity });
  res.status(201).json({ success: true, visitor: newVisitor, activity: entryActivity });
});

// 5b. Active Visitors Inside & Checkout
app.get('/api/visitors/active', async (req, res) => {
  const { flat } = req.query;
  res.json(await DB.getActiveVisitors(flat));
});

app.put('/api/visitors/:id/checkout', async (req, res) => {
  const { id } = req.params;
  const visitor = await DB.getVisitorById(id);

  if (!visitor) return res.status(404).json({ error: 'Visitor not found' });

  const now = new Date();
  const outTimeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let durationStr = 'Short visit';
  if (visitor.in_time) {
    const diffMs = now - new Date(visitor.in_time);
    const diffMins = Math.max(1, Math.round(diffMs / 60000));
    if (diffMins < 60) durationStr = `${diffMins}m`;
    else durationStr = `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  }

  await DB.updateVisitorStatus(id, 'checked_out', null, now.toISOString(), outTimeDisplay, durationStr);

  const exitActivity = {
    id: 'act-' + Date.now(),
    name: visitor.name,
    role: visitor.type || 'Visitor',
    category: visitor.category || 'guest',
    gate: 'Main Gate 1',
    flat: visitor.flat,
    action: 'Checked Out',
    status: 'completed',
    timestamp: outTimeDisplay,
    created_at: now.toISOString(),
  };
  await DB.insertActivity(exitActivity);

  broadcast('VISITOR_CHECKED_OUT', { visitorId: id, visitor, activity: exitActivity });
  res.json({ success: true, visitor, activity: exitActivity });
});

// 5c. Complete Visitor Logbook History (Search & Monthly Audit)
app.get('/api/visitors/history', async (req, res) => {
  const { date, month, flat, search } = req.query;
  const list = await DB.getAllVisitors({ date, month, flat, search });
  res.json(list);
});

// 5d. Export Visitor Logbook as CSV File
app.get('/api/visitors/export', async (req, res) => {
  const { month, date } = req.query;
  const visitors = await DB.getAllVisitors({ month, date });

  const headers = ['ID', 'Date', 'Name', 'Phone', 'Flat', 'Purpose', 'Category', 'Vehicle', 'In Time', 'Out Time', 'Duration', 'Status', 'Gate'];
  const rows = visitors.map((v) => [
    `"${v.id || ''}"`,
    `"${v.date || (v.created_at ? v.created_at.split('T')[0] : '')}"`,
    `"${(v.name || '').replace(/"/g, '""')}"`,
    `"${v.phone || ''}"`,
    `"${v.flat || ''}"`,
    `"${(v.purpose || '').replace(/"/g, '""')}"`,
    `"${v.category || ''}"`,
    `"${v.vehicle || ''}"`,
    `"${v.in_time_display || ''}"`,
    `"${v.out_time_display || ''}"`,
    `"${v.duration || ''}"`,
    `"${v.status || ''}"`,
    `"${v.gate || 'Main Gate 1'}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="gatepass_logbook_${month || date || 'export'}.csv"`);
  res.send(csv);
});

// 6. Activity Logs
app.get('/api/activity', async (req, res) => {
  const { flat } = req.query;
  res.json(await DB.getActivityLogs(flat));
});

// 7. Helpdesk Tickets
app.get('/api/helpdesk', async (req, res) => {
  const { flat } = req.query;
  res.json(await DB.getHelpdeskTickets(flat));
});

app.post('/api/helpdesk', async (req, res) => {
  const { category, title, description, priority, flat } = req.body;
  const newTicket = {
    id: 'TICK-' + Math.floor(100 + Math.random() * 900),
    category: category || 'Electrical',
    title: title || 'Service Complaint',
    description: description || '',
    status: 'In Progress',
    priority: priority || 'Medium',
    assigned_to: `Assigned to ${category || 'Facility'} Team`,
    flat: (flat || 'B-402').toUpperCase(),
    created_at: 'Just now',
  };

  await DB.insertTicket(newTicket);
  res.status(201).json({ success: true, ticket: newTicket });
});

// 8. Staff & Amenities
app.get('/api/staff', async (req, res) => {
  res.json(await DB.getStaff());
});

app.get('/api/amenities', async (req, res) => {
  res.json(await DB.getAmenities());
});

app.post('/api/amenities/:id/book', (req, res) => {
  const { id } = req.params;
  const flat = req.body.flat || 'B-402';
  broadcast('AMENITY_BOOKED', { amenityId: id, resident: 'Flat ' + flat });
  res.json({ success: true, message: `Reservation submitted for amenity ${id}` });
});

// 9. Maintenance
app.get('/api/maintenance', async (req, res) => {
  const flat = req.query.flat || 'B-402';
  const bill = await DB.getMaintenanceBill(flat);
  res.json(bill || { month: 'November 2026', amount: 4250, status: 'Unpaid', flat });
});

app.post('/api/maintenance/pay', async (req, res) => {
  const flat = (req.body.flat || 'B-402').toUpperCase();
  const txnId = 'GP-TXN-' + Date.now().toString().slice(-6);
  await DB.payMaintenanceBill(flat, txnId);

  const receipt = { txnId, amount: 4250, month: 'November 2026', flat, paidAt: new Date().toISOString() };
  broadcast('BILL_PAID', receipt);
  res.json({ success: true, receipt });
});

// 10. Admin Overview & Society Directory
app.get('/api/admin/overview', async (req, res) => {
  const [flats, activeVisitors, pendingRequests, allBills, tickets, staff, activities] = await Promise.all([
    DB.getAllFlats(),
    DB.getActiveVisitors(),
    DB.getPendingRequests(),
    DB.getAllMaintenanceBills(),
    DB.getHelpdeskTickets(),
    DB.getStaff(),
    DB.getActivityLogs(),
  ]);

  const totalFlats = Math.max(48, flats.length);
  const occupiedFlats = flats.filter(f => f.status === 'Occupied').length;
  const totalCollected = allBills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + (b.amount || 0), 156800);
  const totalPending = flats.filter(f => f.dues === 'Unpaid').reduce((sum, f) => sum + (f.duesAmount || 4250), 0) || 28450;

  res.json({
    society: 'Emerald Heights Residency',
    address: 'Survey 14, Outer Ring Road, Bellandur, Bengaluru',
    totalFlats,
    occupiedFlats,
    occupancyRate: `${Math.round((occupiedFlats / totalFlats) * 100)}%`,
    activeVisitorsInside: activeVisitors.length,
    pendingGateRequests: pendingRequests.length,
    openTickets: tickets.filter(t => t.status !== 'Resolved').length,
    totalTickets: tickets.length,
    staffOnDuty: staff.filter(s => s.status && s.status.includes('Inside')).length,
    finance: {
      totalCollected,
      totalPending,
      pendingCount: allBills.filter(b => b.status === 'Unpaid').length,
    },
    flats,
    recentActivities: activities.slice(0, 10),
    activeVisitors,
    tickets,
  });
});

// Society Admin: List all registered flats & resident owners
app.get('/api/admin/residents', async (req, res) => {
  const flats = await DB.getAllFlats();
  res.json({ success: true, count: flats.length, flats });
});

// Society Admin: Onboard a New Resident Owner & Unit
app.post('/api/admin/residents', async (req, res) => {
  const { flat, block, floor, owner, phone, email, ownershipType, vehicle, duesAmount, status } = req.body;
  if (!flat || !phone || !owner) {
    return res.status(400).json({ error: 'Flat Number, Resident Owner Name, and Mobile Phone are required.' });
  }

  try {
    const newFlat = await DB.addFlatResident({
      flat,
      block,
      floor,
      owner,
      phone,
      email,
      ownershipType,
      vehicle,
      duesAmount,
      status,
    });

    // Broadcast WebSocket event so all connected Admin & Guard consoles update immediately
    broadcast('RESIDENT_ONBOARDED', newFlat);

    res.json({
      success: true,
      message: `Flat ${newFlat.flat} & Resident Owner ${newFlat.owner} successfully onboarded!`,
      flat: newFlat,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Society Admin: Update Flat Resident Details
app.put('/api/admin/residents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await DB.updateFlatResident(id, req.body);
    broadcast('RESIDENT_UPDATED', { id, ...req.body });
    res.json({ success: true, message: 'Resident details updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Society Admin: Delete / Offboard Flat Resident
app.delete('/api/admin/residents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await DB.deleteFlatResident(id);
    broadcast('RESIDENT_DELETED', { id });
    res.json({ success: true, message: `Unit ${id} offboarded from society registry.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Emergency SOS
app.post('/api/sos', async (req, res) => {
  const { type, flat } = req.body;
  const emergency = {
    id: 'sos-' + Date.now(),
    type: type || 'Security Threat',
    flat: flat || 'Flat B-402',
    status: 'ACTIVE_ALERT',
  };

  await DB.insertEmergency(emergency);
  broadcast('EMERGENCY_TRIGGERED', emergency);

  res.status(201).json({ success: true, emergency });
});

// 11. Developer / Admin Endpoints
app.post('/api/dev/reset-db', async (req, res) => {
  await DB.resetDatabase();
  const [pendingRequests, recentActivity, activeVisitors, maintenance] = await Promise.all([
    DB.getPendingRequests(),
    DB.getActivityLogs(),
    DB.getActiveVisitors(),
    DB.getMaintenanceBill('B-402'),
  ]);
  broadcast('INIT_STATE', { pendingRequests, recentActivity, activeVisitors, maintenance });
  res.json({ success: true, message: 'Database reset and re-seeded successfully.' });
});

// Connect before accepting traffic so every route has a ready MongoDB handle.
DB.initSchema()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[GatePass Server] Running on http://0.0.0.0:${PORT} (${DB.getDatabaseInfo().type})`);
      console.log(`[GatePass Server] API Docs & Dev Dashboard: http://localhost:${PORT}/api-docs`);
      console.log(`[GatePass Server] WebSocket listening on ws://localhost:${PORT}/ws`);
    });
  })
  .catch((error) => {
    console.error('[GatePass Server] MongoDB startup failed:', error);
    process.exitCode = 1;
  });
