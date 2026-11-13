const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'gatepass.db');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      role TEXT NOT NULL, -- 'admin' | 'resident' | 'guard'
      flat TEXT,
      gate TEXT,
      pin TEXT,
      password TEXT,
      badge_id TEXT,
      society TEXT DEFAULT 'Emerald Heights Residency',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      type TEXT NOT NULL, -- 'Guest' | 'Delivery' | 'Cab' | 'Staff'
      category TEXT NOT NULL,
      vehicle TEXT,
      gate TEXT DEFAULT 'Main Gate 1',
      purpose TEXT,
      flat TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'denied' | 'checked_out'
      in_time DATETIME,
      out_time DATETIME,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS passes (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      type TEXT NOT NULL,
      flat TEXT NOT NULL,
      valid_until TEXT,
      leave_at_gate INTEGER DEFAULT 0,
      is_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      category TEXT NOT NULL,
      gate TEXT NOT NULL,
      flat TEXT DEFAULT 'B-402',
      action TEXT NOT NULL,
      status TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS helpdesk_tickets (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'In Progress',
      priority TEXT DEFAULT 'Medium',
      assigned_to TEXT,
      flat TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      rating TEXT,
      phone TEXT,
      status TEXT,
      entry_time TEXT,
      flats_worked TEXT,
      badge TEXT,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS amenities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      capacity TEXT,
      timing TEXT,
      status TEXT,
      price TEXT,
      icon TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS maintenance_bills (
      id TEXT PRIMARY KEY,
      flat TEXT NOT NULL,
      month TEXT NOT NULL,
      due_date TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'Unpaid',
      paid_at DATETIME,
      txn_id TEXT
    );

    CREATE TABLE IF NOT EXISTS emergencies (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      flat TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'ACTIVE_ALERT'
    );
  `);

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  console.log('[SQLite DB] Seeding initial database records...');

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, phone, email, role, flat, gate, pin, password, badge_id, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 1. Admin
  insertUser.run(
    'admin-1',
    'Col. R. S. Rathore (Estate Admin)',
    '9899900001',
    'admin@gatepass.com',
    'admin',
    null,
    null,
    null,
    'admin123',
    'ADMIN-01',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  );

  // 2. Residents (Flat Owners)
  insertUser.run(
    'res-1',
    'Vishwa (Resident Owner)',
    '9876543210',
    'vishwa@residence.com',
    'resident',
    'B-402',
    null,
    null,
    null,
    null,
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );
  insertUser.run(
    'res-2',
    'Pooja Malhotra (Resident Owner)',
    '9811122233',
    'pooja@residence.com',
    'resident',
    'A-104',
    null,
    null,
    null,
    null,
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  );
  insertUser.run(
    'res-3',
    'Dr. Alok Verma (Resident Owner)',
    '9822233445',
    'alok@residence.com',
    'resident',
    'C-201',
    null,
    null,
    null,
    null,
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  );

  // 3. Security Guards
  insertUser.run(
    'sec-104',
    'Rajesh Kumar (Duty Officer)',
    '9900011222',
    'guard1@gatepass.com',
    'guard',
    null,
    'Main Gate #1',
    '1234',
    null,
    'SEC-104',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  );
  insertUser.run(
    'sec-108',
    'Sunil Shinde',
    '9900033444',
    'guard2@gatepass.com',
    'guard',
    null,
    'Service Gate #2',
    '1234',
    null,
    'SEC-108',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  );

  // Visitors
  const insertVisitor = db.prepare(`
    INSERT INTO visitors (id, name, phone, type, category, vehicle, gate, purpose, flat, status, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertVisitor.run('req-1', 'Rahul Sharma', '+91 98765 43210', 'Guest', 'guest', 'KA-03-MG-4120', 'Main Gate 1', 'Visiting Flat B-402', 'B-402', 'pending', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  insertVisitor.run('req-2', 'Mukesh Kumar (Zomato)', '+91 91234 56789', 'Delivery', 'delivery', null, 'Service Gate 2', 'Food Delivery • Order #84920', 'B-402', 'pending', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80');
  insertVisitor.run('req-3', 'Amazon Courier (Karan)', '+91 98112 00011', 'Delivery', 'delivery', null, 'Service Gate 2', 'Parcel Delivery for Flat A-104', 'A-104', 'pending', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80');

  // Active visitors
  insertVisitor.run('v-1', 'Dr. Alok Verma', '+91 98333 44555', 'Guest', 'guest', null, 'Main Gate 1', 'Visiting Flat B-402', 'B-402', 'approved', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  insertVisitor.run('v-2', 'Urban Company AC Tech', '+91 98444 11223', 'Staff', 'service', null, 'Main Gate 1', 'AC Service Flat B-201', 'B-201', 'approved', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80');

  // Passes
  const insertPass = db.prepare(`
    INSERT INTO passes (code, name, phone, type, flat, valid_until, leave_at_gate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertPass.run('GP-7821', 'Priyanshu Sharma', '+91 98765 11223', 'guest', 'B-402', 'Tomorrow, 11:59 PM', 0);
  insertPass.run('GP-9014', 'Ravi Shankar (Interior Architect)', '+91 98111 55667', 'service', 'A-104', 'Tomorrow, 08:00 PM', 0);

  // Activity Logs
  const insertActivity = db.prepare(`
    INSERT INTO activity_logs (id, name, role, category, gate, flat, action, status, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertActivity.run('act-1', 'Sunita Devi', 'House Maid', 'staff', 'Main Gate 1', 'B-402', 'Checked In', 'approved', 'Today, 08:30 AM');
  insertActivity.run('act-2', 'Uber (Swift Dzire)', 'Cab / Taxi', 'cab', 'Main Gate 1', 'B-402', 'Allowed Entry', 'approved', 'Today, 09:15 AM');
  insertActivity.run('act-3', 'Amazon Courier (Rajesh)', 'Delivery', 'delivery', 'Gate 2 (Parcel Desk)', 'B-402', 'Left at Security Desk', 'completed', 'Yesterday, 04:45 PM');
  insertActivity.run('act-4', 'Dr. Alok Verma', 'Guest', 'guest', 'Main Gate 1', 'B-402', 'Checked Out', 'completed', 'Yesterday, 07:10 PM');
  insertActivity.run('act-5', 'Blinkit Delivery', 'Delivery', 'delivery', 'Service Gate 2', 'A-104', 'Allowed Entry', 'approved', 'Today, 11:10 AM');

  // Staff
  const insertStaff = db.prepare(`
    INSERT INTO staff (id, name, role, rating, phone, status, entry_time, flats_worked, badge, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStaff.run('staff-1', 'Sunita Devi', 'Housekeeping / Maid', '4.9 ★', '+91 98220 11223', 'Inside Society', '08:30 AM', '6 Flats (Block B & C)', 'Police Verified', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80');
  insertStaff.run('staff-2', 'Ramesh Patel', 'Car Cleaner & Driver', '4.8 ★', '+91 97334 22119', 'Inside Society', '06:45 AM', '4 Flats (Block B)', 'Police Verified', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80');
  insertStaff.run('staff-3', 'Anjali Rawat', 'Cook & Chef', '5.0 ★', '+91 94112 88440', 'Expected at 06:00 PM', '-', '3 Flats (Block B)', 'Police Verified', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80');
  insertStaff.run('staff-4', 'Mohammad Farooq', 'Society Electrician', '4.9 ★', '+91 98450 33441', 'On Duty • Estate Office', '08:00 AM', 'Emerald Heights Facility Team', 'Official Staff', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80');

  // Amenities
  const insertAmenity = db.prepare(`
    INSERT INTO amenities (id, name, capacity, timing, status, price, icon, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAmenity.run('am-1', 'Clubhouse Banquet Hall', '150 People', '09:00 AM - 11:00 PM', 'Available', '₹2,500 / slot', 'home', 'Air-conditioned banquet hall with stage & sound system.');
  insertAmenity.run('am-2', 'Olympic Swimming Pool', '30 People', '06:00 AM - 09:00 PM', 'Open Today', 'Free for Residents', 'water', 'Temperature-controlled 25m pool with dedicated lifeguard.');
  insertAmenity.run('am-3', 'Floodlit Tennis Court', '4 Players', '06:00 AM - 10:00 PM', 'Slots Open', '₹150 / hr', 'tennisball', 'Hard court with LED floodlights.');
  insertAmenity.run('am-4', 'Fitness & Cardio Gym', '25 People', '05:30 AM - 10:30 PM', 'Open Today', 'Free for Residents', 'barbell', 'State-of-the-art gym with weights & trainer.');

  // Maintenance Bills per flat
  const insertBill = db.prepare(`
    INSERT INTO maintenance_bills (id, flat, month, due_date, amount, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertBill.run('bill-b402', 'B-402', 'November 2026', '15 Nov 2026', 4250, 'Unpaid');
  insertBill.run('bill-a104', 'A-104', 'November 2026', '15 Nov 2026', 3600, 'Unpaid');
  insertBill.run('bill-c201', 'C-201', 'November 2026', '15 Nov 2026', 4100, 'Paid');

  // Helpdesk
  const insertTicket = db.prepare(`
    INSERT INTO helpdesk_tickets (id, category, title, description, status, priority, assigned_to, flat, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTicket.run('TICK-101', 'Electrical', 'Corridor Light Flickering outside Flat B-402', 'Ceiling LED panel flickering.', 'In Progress', 'Medium', 'Mohammad Farooq (Electrician)', 'B-402', 'Today, 10:15 AM');
  insertTicket.run('TICK-102', 'Plumbing', 'Water Pressure Issue in Kitchen Sink', 'Low water pressure line.', 'Resolved', 'Low', 'Kishore (Plumber)', 'B-402', 'Yesterday, 02:30 PM');
  insertTicket.run('TICK-103', 'Carpentry', 'Main Door Latch Stiff in Flat A-104', 'Lock needs alignment.', 'In Progress', 'High', 'Raju (Carpenter)', 'A-104', 'Today, 09:30 AM');

  console.log('[SQLite DB] Seeding completed.');
}

const DB = {
  db,
  initSchema,
  resetDatabase() {
    db.exec(`
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS visitors;
      DROP TABLE IF EXISTS passes;
      DROP TABLE IF EXISTS activity_logs;
      DROP TABLE IF EXISTS helpdesk_tickets;
      DROP TABLE IF EXISTS staff;
      DROP TABLE IF EXISTS amenities;
      DROP TABLE IF EXISTS maintenance_bills;
      DROP TABLE IF EXISTS emergencies;
    `);
    initSchema();
  },

  // Auth & Users
  getUsersByRole: (role) => db.prepare('SELECT * FROM users WHERE role = ?').all(role),
  getUserByPhoneAndFlat: (phone, flat) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanFlat = flat.trim().toUpperCase();
    return db.prepare('SELECT * FROM users WHERE (phone = ? OR phone LIKE ?) AND UPPER(flat) = ?')
      .get(cleanPhone, `%${cleanPhone}%`, cleanFlat);
  },
  getUserByBadgeOrPhone: (idOrPhone) => {
    const clean = idOrPhone.trim();
    return db.prepare('SELECT * FROM users WHERE UPPER(badge_id) = ? OR phone = ?')
      .get(clean.toUpperCase(), clean);
  },
  getUserByEmail: (email) => {
    return db.prepare('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(badge_id) = ?')
      .get(email.trim().toLowerCase(), email.trim().toLowerCase());
  },
  getDemoUsers: () => {
    const admins = db.prepare("SELECT * FROM users WHERE role = 'admin'").all();
    const residents = db.prepare("SELECT * FROM users WHERE role = 'resident'").all();
    const guards = db.prepare("SELECT * FROM users WHERE role = 'guard'").all();
    return { admins, residents, guards };
  },

  // Visitors (Filtered by flat if requested)
  getPendingRequests: (flat = null) => {
    if (flat) {
      return db.prepare("SELECT * FROM visitors WHERE status = 'pending' AND UPPER(flat) = ? ORDER BY created_at DESC").all(flat.toUpperCase());
    }
    return db.prepare("SELECT * FROM visitors WHERE status = 'pending' ORDER BY created_at DESC").all();
  },
  getActiveVisitors: (flat = null) => {
    if (flat) {
      return db.prepare("SELECT * FROM visitors WHERE status = 'approved' AND UPPER(flat) = ? ORDER BY in_time DESC").all(flat.toUpperCase());
    }
    return db.prepare("SELECT * FROM visitors WHERE status = 'approved' ORDER BY in_time DESC").all();
  },
  getVisitorById: (id) => db.prepare('SELECT * FROM visitors WHERE id = ?').get(id),
  insertVisitor: (v) => {
    db.prepare(`
      INSERT INTO visitors (id, name, phone, type, category, vehicle, gate, purpose, flat, status, in_time, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(v.id, v.name, v.phone, v.type, v.category, v.vehicle || null, v.gate, v.purpose, v.flat, v.status || 'pending', v.in_time || null, v.image || null);
  },
  updateVisitorStatus: (id, status, inTime = null, outTime = null) => {
    db.prepare('UPDATE visitors SET status = ?, in_time = COALESCE(?, in_time), out_time = COALESCE(?, out_time) WHERE id = ?')
      .run(status, inTime, outTime, id);
  },

  // Passes
  getPasses: (flat = null) => {
    if (flat) {
      return db.prepare('SELECT * FROM passes WHERE UPPER(flat) = ? ORDER BY created_at DESC').all(flat.toUpperCase());
    }
    return db.prepare('SELECT * FROM passes ORDER BY created_at DESC').all();
  },
  getPassByCode: (code) => db.prepare('SELECT * FROM passes WHERE code = ?').get(code),
  insertPass: (p) => {
    db.prepare(`
      INSERT INTO passes (code, name, phone, type, flat, valid_until, leave_at_gate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(p.code, p.name, p.phone, p.type, p.flat, p.valid_until, p.leave_at_gate ? 1 : 0);
  },

  // Activity Logs
  getActivityLogs: (flat = null) => {
    if (flat) {
      return db.prepare('SELECT * FROM activity_logs WHERE UPPER(flat) = ? ORDER BY created_at DESC LIMIT 50').all(flat.toUpperCase());
    }
    return db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50').all();
  },
  insertActivity: (a) => {
    db.prepare(`
      INSERT INTO activity_logs (id, name, role, category, gate, flat, action, status, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(a.id, a.name, a.role, a.category, a.gate, a.flat || 'B-402', a.action, a.status, a.timestamp);
  },

  // Helpdesk
  getHelpdeskTickets: (flat = null) => {
    if (flat) {
      return db.prepare('SELECT * FROM helpdesk_tickets WHERE UPPER(flat) = ? ORDER BY created_at DESC').all(flat.toUpperCase());
    }
    return db.prepare('SELECT * FROM helpdesk_tickets ORDER BY created_at DESC').all();
  },
  insertTicket: (t) => {
    db.prepare(`
      INSERT INTO helpdesk_tickets (id, category, title, description, status, priority, assigned_to, flat, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(t.id, t.category, t.title, t.description, t.status, t.priority, t.assigned_to, t.flat, t.created_at);
  },

  // Staff & Amenities
  getStaff: () => db.prepare('SELECT * FROM staff').all(),
  getAmenities: () => db.prepare('SELECT * FROM amenities').all(),

  // Maintenance
  getMaintenanceBill: (flat = 'B-402') => {
    const bill = db.prepare('SELECT * FROM maintenance_bills WHERE UPPER(flat) = ?').get(flat.toUpperCase());
    return bill || { month: 'November 2026', amount: 4250, status: 'Unpaid', flat };
  },
  getAllMaintenanceBills: () => db.prepare('SELECT * FROM maintenance_bills').all(),
  payMaintenanceBill: (flat, txnId) => {
    db.prepare("UPDATE maintenance_bills SET status = 'Paid', txn_id = ?, paid_at = CURRENT_TIMESTAMP WHERE UPPER(flat) = ?")
      .run(txnId, flat.toUpperCase());
  },

  // Emergency
  insertEmergency: (e) => {
    db.prepare('INSERT INTO emergencies (id, type, flat, status) VALUES (?, ?, ?, ?)')
      .run(e.id, e.type, e.flat, e.status || 'ACTIVE_ALERT');
  },
  getEmergencies: () => db.prepare('SELECT * FROM emergencies ORDER BY timestamp DESC').all(),
};

initSchema();

module.exports = DB;
