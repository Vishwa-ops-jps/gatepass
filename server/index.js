const http = require('http');
const express = require('express');
const cors = require('cors');
const { WebSocketServer, WebSocket } = require('ws');
const store = require('./store');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
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
  console.log('[WebSocket] Client connected. Total clients:', wss.clients.size);

  // Send initial welcome & full current state
  ws.send(
    JSON.stringify({
      event: 'INIT_STATE',
      data: {
        pendingRequests: store.pendingRequests,
        recentActivity: store.recentActivity,
        activeVisitors: store.activeVisitors,
        maintenance: store.maintenance,
      },
    })
  );

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected.');
  });
});

// REST Endpoints

// 1. Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'GatePass Backend',
    timestamp: new Date().toISOString(),
    connectedClients: wss.clients.size,
  });
});

// 2. Pending Requests (Guard & Resident)
app.get('/api/requests', (req, res) => {
  res.json(store.pendingRequests);
});

// Guard creates a new visitor check-in request (Rings Resident Flat)
app.post('/api/requests', (req, res) => {
  const { name, phone, type, category, vehicle, gate, purpose, flat } = req.body;
  const newReq = {
    id: 'req-' + Date.now(),
    name: name || 'Visitor',
    phone: phone || '+91 99000 00000',
    type: type || 'Guest',
    category: category || 'guest',
    vehicle: vehicle || null,
    gate: gate || 'Main Gate 1',
    time: 'Just now',
    purpose: purpose || `Visiting Flat ${flat || 'B-402'}`,
    flat: flat || 'B-402',
    status: 'pending',
  };

  store.pendingRequests.unshift(newReq);
  broadcast('REQUEST_CREATED', newReq);

  res.status(201).json({ success: true, request: newReq });
});

// Resident Approves visitor
app.put('/api/requests/:id/approve', (req, res) => {
  const { id } = req.params;
  const { leaveAtGate } = req.body;
  const idx = store.pendingRequests.findIndex((r) => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const [reqItem] = store.pendingRequests.splice(idx, 1);

  const newActivity = {
    id: 'act-' + Date.now(),
    name: reqItem.name,
    role: reqItem.type,
    category: reqItem.category,
    time: 'Just now',
    gate: reqItem.gate,
    action: leaveAtGate ? 'Left at Gate' : 'Allowed Entry',
    status: 'approved',
  };
  store.recentActivity.unshift(newActivity);

  let newActiveVisitor = null;
  if (!leaveAtGate) {
    newActiveVisitor = {
      id: 'v-' + Date.now(),
      name: reqItem.name,
      flat: reqItem.flat || 'B-402',
      inTime: 'Just now',
    };
    store.activeVisitors.unshift(newActiveVisitor);
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

// Resident Denies visitor
app.put('/api/requests/:id/deny', (req, res) => {
  const { id } = req.params;
  const idx = store.pendingRequests.findIndex((r) => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const [reqItem] = store.pendingRequests.splice(idx, 1);

  const newActivity = {
    id: 'act-' + Date.now(),
    name: reqItem.name,
    role: reqItem.type,
    category: reqItem.category,
    time: 'Just now',
    gate: reqItem.gate,
    action: 'Denied Entry',
    status: 'denied',
  };
  store.recentActivity.unshift(newActivity);

  const payload = { requestId: id, activity: newActivity };
  broadcast('REQUEST_RESOLVED', { ...payload, action: 'denied' });

  res.json({ success: true, ...payload });
});

// 3. Pre-Approved Passes
app.get('/api/passes', (req, res) => {
  res.json(store.passes);
});

// Resident creates pre-approved pass
app.post('/api/passes', (req, res) => {
  const { name, phone, type, leaveAtGate } = req.body;
  const newPass = {
    code: 'GP-' + Math.floor(1000 + Math.random() * 9000),
    name: name || 'Invited Guest',
    phone: phone || '',
    type: type || 'guest',
    flat: 'B-402',
    validUntil: 'Tomorrow, 11:59 PM',
    leaveAtGate: !!leaveAtGate,
    createdAt: new Date().toISOString(),
  };

  store.passes.unshift(newPass);
  broadcast('PASS_CREATED', newPass);

  res.status(201).json({ success: true, pass: newPass });
});

// Guard verifies passcode
app.post('/api/passes/verify', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const cleanCode = code.trim().toUpperCase();
  const pass = store.passes.find((p) => p.code.toUpperCase() === cleanCode);

  if (pass) {
    // Add to active visitors
    const newActiveVisitor = {
      id: 'v-' + Date.now(),
      name: pass.name,
      flat: pass.flat,
      inTime: 'Just now',
    };
    store.activeVisitors.unshift(newActiveVisitor);

    const newActivity = {
      id: 'act-' + Date.now(),
      name: pass.name,
      role: 'Pre-Approved ' + pass.type,
      category: pass.type,
      time: 'Just now',
      gate: 'Main Gate 1',
      action: 'Verified & Entered',
      status: 'approved',
    };
    store.recentActivity.unshift(newActivity);

    broadcast('PASS_VERIFIED', { pass, activeVisitor: newActiveVisitor, activity: newActivity });

    return res.json({
      valid: true,
      message: `Passcode ${cleanCode} is valid for Flat ${pass.flat}`,
      pass,
    });
  }

  // Also accept standard demo pattern GP-xxxx
  if (cleanCode.startsWith('GP-')) {
    const tempPass = {
      code: cleanCode,
      name: 'Pre-Approved Visitor',
      flat: 'B-402',
      type: 'guest',
    };
    const newActiveVisitor = {
      id: 'v-' + Date.now(),
      name: tempPass.name,
      flat: 'B-402',
      inTime: 'Just now',
    };
    store.activeVisitors.unshift(newActiveVisitor);
    broadcast('PASS_VERIFIED', { pass: tempPass, activeVisitor: newActiveVisitor });

    return res.json({
      valid: true,
      message: `Passcode ${cleanCode} validated successfully for Flat B-402`,
      pass: tempPass,
    });
  }

  res.status(404).json({ valid: false, message: 'Invalid or expired passcode' });
});

// 4. Visitors Inside & Checkout
app.get('/api/visitors/active', (req, res) => {
  res.json(store.activeVisitors);
});

app.put('/api/visitors/:id/checkout', (req, res) => {
  const { id } = req.params;
  const idx = store.activeVisitors.findIndex((v) => v.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Visitor not found' });
  }

  const [visitor] = store.activeVisitors.splice(idx, 1);

  const exitActivity = {
    id: 'act-' + Date.now(),
    name: visitor.name,
    role: 'Visitor',
    category: 'guest',
    time: 'Just now',
    gate: 'Main Gate 1',
    action: 'Checked Out',
    status: 'completed',
  };
  store.recentActivity.unshift(exitActivity);

  broadcast('VISITOR_CHECKED_OUT', { visitorId: id, visitor, activity: exitActivity });

  res.json({ success: true, visitor, activity: exitActivity });
});

// 5. Activity Log
app.get('/api/activity', (req, res) => {
  res.json(store.recentActivity);
});

// 6. Staff & Helpers
app.get('/api/staff', (req, res) => {
  res.json(store.staff);
});

// 7. Amenities & Booking
app.get('/api/amenities', (req, res) => {
  res.json(store.amenities);
});

app.post('/api/amenities/:id/book', (req, res) => {
  const { id } = req.params;
  const amenity = store.amenities.find((a) => a.id === id);

  if (!amenity) {
    return res.status(404).json({ error: 'Amenity not found' });
  }

  broadcast('AMENITY_BOOKED', { amenity, resident: 'Flat B-402' });
  res.json({ success: true, message: `Slot booked for ${amenity.name}` });
});

// 8. Maintenance & Payment
app.get('/api/maintenance', (req, res) => {
  res.json(store.maintenance);
});

app.post('/api/maintenance/pay', (req, res) => {
  store.maintenance.status = 'Paid';
  const receipt = {
    txnId: 'GP-TXN-' + Date.now().toString().slice(-6),
    amount: store.maintenance.amount,
    month: store.maintenance.month,
    paidAt: new Date().toISOString(),
  };

  broadcast('BILL_PAID', receipt);
  res.json({ success: true, receipt });
});

// 9. Emergency SOS
app.post('/api/sos', (req, res) => {
  const { type, flat } = req.body;
  const emergency = {
    id: 'sos-' + Date.now(),
    type: type || 'Security Threat',
    flat: flat || 'Flat B-402',
    timestamp: new Date().toISOString(),
    status: 'ACTIVE_ALERT',
  };

  store.emergencies.unshift(emergency);
  broadcast('EMERGENCY_TRIGGERED', emergency);

  res.status(201).json({ success: true, emergency });
});

// Start listening
server.listen(PORT, () => {
  console.log(`[GatePass Server] Running on http://localhost:${PORT}`);
  console.log(`[GatePass Server] WebSocket listening on ws://localhost:${PORT}/ws`);
});
