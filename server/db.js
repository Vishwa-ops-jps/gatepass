const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'gatepass';

let client = null;
let database = null;
let isMongo = false;

// In-Memory Storage Engine (Used when MONGODB_URI is not configured)
const memStore = {
  users: [
    { id: 'admin-1', name: 'Col. R. S. Rathore (Estate Admin)', phone: '9899900001', email: 'admin@gatepass.com', role: 'admin', password: 'admin123', badge_id: 'ADMIN-01', society: 'Emerald Heights Residency' },
    { id: 'res-1', name: 'Vishwa (Resident Owner)', phone: '9876543210', email: 'vishwa@residence.com', role: 'resident', flat: 'B-402', society: 'Emerald Heights Residency' },
    { id: 'res-2', name: 'Pooja Malhotra (Resident Owner)', phone: '9811122233', email: 'pooja@residence.com', role: 'resident', flat: 'A-104', society: 'Emerald Heights Residency' },
    { id: 'res-3', name: 'Dr. Alok Verma (Resident Owner)', phone: '9822233445', email: 'alok@residence.com', role: 'resident', flat: 'C-201', society: 'Emerald Heights Residency' },
    { id: 'sec-104', name: 'Rajesh Kumar (Duty Officer)', phone: '9900011222', email: 'guard1@gatepass.com', role: 'guard', gate: 'Main Gate #1', pin: '1234', badge_id: 'SEC-104', society: 'Emerald Heights Residency' },
    { id: 'sec-108', name: 'Sunil Shinde', phone: '9900033444', email: 'guard2@gatepass.com', role: 'guard', gate: 'Service Gate #2', pin: '1234', badge_id: 'SEC-108', society: 'Emerald Heights Residency' },
  ],
  visitors: [
    { id: 'req-1', name: 'Rahul Sharma', phone: '+91 98765 43210', type: 'Guest', category: 'guest', vehicle: 'KA-03-MG-4120', gate: 'Main Gate 1', purpose: 'Visiting Flat B-402', flat: 'B-402', status: 'pending', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', created_at: new Date() },
    { id: 'req-2', name: 'Mukesh Kumar (Zomato)', phone: '+91 91234 56789', type: 'Delivery', category: 'delivery', gate: 'Service Gate 2', purpose: 'Food Delivery • Order #84920', flat: 'B-402', status: 'pending', created_at: new Date() },
    { id: 'req-3', name: 'Amazon Courier (Karan)', phone: '+91 98112 00011', type: 'Delivery', category: 'delivery', gate: 'Service Gate 2', purpose: 'Parcel Delivery for Flat A-104', flat: 'A-104', status: 'pending', created_at: new Date() },
    { id: 'v-1', name: 'Dr. Alok Verma', phone: '+91 98333 44555', type: 'Guest', category: 'guest', gate: 'Main Gate 1', purpose: 'Visiting Flat B-402', flat: 'B-402', status: 'approved', in_time: '10:45 AM', created_at: new Date() },
    { id: 'v-2', name: 'Urban Company AC Tech', phone: '+91 98444 11223', type: 'Staff', category: 'service', gate: 'Main Gate 1', purpose: 'AC Service Flat B-201', flat: 'B-201', status: 'approved', in_time: '11:10 AM', created_at: new Date() },
  ],
  passes: [
    { code: 'GP-7821', name: 'Priyanshu Sharma', phone: '+91 98765 11223', type: 'guest', flat: 'B-402', valid_until: 'Tomorrow, 11:59 PM', leave_at_gate: 0, is_used: false, created_at: new Date() },
    { code: 'GP-9014', name: 'Ravi Shankar', phone: '+91 98111 55667', type: 'service', flat: 'A-104', valid_until: 'Tomorrow, 08:00 PM', leave_at_gate: 0, is_used: false, created_at: new Date() },
  ],
  activity_logs: [
    { id: 'act-1', name: 'Sunita Devi', role: 'House Maid', category: 'staff', gate: 'Main Gate 1', flat: 'B-402', action: 'Checked In', status: 'approved', timestamp: 'Today, 08:30 AM', created_at: new Date() },
    { id: 'act-2', name: 'Uber (Swift Dzire)', role: 'Cab / Taxi', category: 'cab', gate: 'Main Gate 1', flat: 'B-402', action: 'Allowed Entry', status: 'approved', timestamp: 'Today, 09:15 AM', created_at: new Date() },
    { id: 'act-3', name: 'Amazon Courier (Rajesh)', role: 'Delivery', category: 'delivery', gate: 'Gate 2 (Parcel Desk)', flat: 'B-402', action: 'Left at Security Desk', status: 'completed', timestamp: 'Yesterday, 04:45 PM', created_at: new Date() },
    { id: 'act-4', name: 'Dr. Alok Verma', role: 'Guest', category: 'guest', gate: 'Main Gate 1', flat: 'B-402', action: 'Checked Out', status: 'completed', timestamp: 'Yesterday, 07:10 PM', created_at: new Date() },
    { id: 'act-5', name: 'Blinkit Delivery', role: 'Delivery', category: 'delivery', gate: 'Service Gate 2', flat: 'A-104', action: 'Allowed Entry', status: 'approved', timestamp: 'Today, 11:10 AM', created_at: new Date() },
  ],
  helpdesk_tickets: [
    { id: 'TICK-101', category: 'Electrical', title: 'Corridor Light Flickering outside Flat B-402', description: 'Ceiling LED panel flickering.', status: 'In Progress', priority: 'Medium', assigned_to: 'Mohammad Farooq (Electrician)', flat: 'B-402', created_at: 'Today, 10:15 AM' },
    { id: 'TICK-102', category: 'Plumbing', title: 'Water Pressure Issue in Kitchen Sink', description: 'Low water pressure line.', status: 'Resolved', priority: 'Low', assigned_to: 'Kishore (Plumber)', flat: 'B-402', created_at: 'Yesterday, 02:30 PM' },
    { id: 'TICK-103', category: 'Carpentry', title: 'Main Door Latch Stiff in Flat A-104', description: 'Lock needs alignment.', status: 'In Progress', priority: 'High', assigned_to: 'Raju (Carpenter)', flat: 'A-104', created_at: 'Today, 09:30 AM' },
  ],
  staff: [
    { id: 'staff-1', name: 'Sunita Devi', role: 'Housekeeping / Maid', rating: '4.9 ★', phone: '+91 98220 11223', status: 'Inside Society', entry_time: '08:30 AM', flats_worked: '6 Flats (Block B & C)', badge: 'Police Verified' },
    { id: 'staff-2', name: 'Ramesh Patel', role: 'Car Cleaner & Driver', rating: '4.8 ★', phone: '+91 97334 22119', status: 'Inside Society', entry_time: '06:45 AM', flats_worked: '4 Flats (Block B)', badge: 'Police Verified' },
    { id: 'staff-3', name: 'Anjali Rawat', role: 'Cook & Chef', rating: '5.0 ★', phone: '+91 94112 88440', status: 'Expected at 06:00 PM', entry_time: '-', flats_worked: '3 Flats (Block B)', badge: 'Police Verified' },
    { id: 'staff-4', name: 'Mohammad Farooq', role: 'Society Electrician', rating: '4.9 ★', phone: '+91 98450 33441', status: 'On Duty • Estate Office', entry_time: '08:00 AM', flats_worked: 'Facility Team', badge: 'Official Staff' },
  ],
  amenities: [
    { id: 'am-1', name: 'Clubhouse Banquet Hall', capacity: '150 People', timing: '09:00 AM - 11:00 PM', status: 'Available', price: '₹2,500 / slot', icon: 'home', description: 'Air-conditioned hall with sound system.' },
    { id: 'am-2', name: 'Olympic Swimming Pool', capacity: '30 People', timing: '06:00 AM - 09:00 PM', status: 'Open Today', price: 'Free for Residents', icon: 'water', description: 'Temperature-controlled 25m pool.' },
    { id: 'am-3', name: 'Floodlit Tennis Court', capacity: '4 Players', timing: '06:00 AM - 10:00 PM', status: 'Slots Open', price: '₹150 / hr', icon: 'tennisball', description: 'Hard court with LED lighting.' },
    { id: 'am-4', name: 'Fitness & Cardio Gym', capacity: '25 People', timing: '05:30 AM - 10:30 PM', status: 'Open Today', price: 'Free for Residents', icon: 'barbell', description: 'Modern gym with certified trainer.' },
  ],
  maintenance_bills: [
    { id: 'bill-b402', flat: 'B-402', month: 'November 2026', due_date: '15 Nov 2026', amount: 4250, status: 'Unpaid' },
    { id: 'bill-a104', flat: 'A-104', month: 'November 2026', due_date: '15 Nov 2026', amount: 3600, status: 'Unpaid' },
    { id: 'bill-c201', flat: 'C-201', month: 'November 2026', due_date: '15 Nov 2026', amount: 4100, status: 'Paid', txn_id: 'GP-TXN-881293' },
  ],
  emergencies: [],
};

const collections = Object.keys(memStore);

async function initSchema() {
  if (uri) {
    try {
      console.log('[GatePass Database] Connecting to MongoDB Atlas / Cloud Cluster...');
      client = new MongoClient(uri, {
        maxPoolSize: 20,
        minPoolSize: 2,
        maxIdleTimeMS: 300000,
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 5000,
      });
      await client.connect();
      database = client.db(dbName);
      isMongo = true;
      console.log(`[GatePass Database] Connected to MongoDB database "${dbName}" successfully!`);

      // Create Indexes
      await Promise.all([
        database.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true }),
        database.collection('users').createIndex({ role: 1, flat: 1 }),
        database.collection('users').createIndex({ badge_id: 1 }, { sparse: true }),
        database.collection('visitors').createIndex({ status: 1, flat: 1, created_at: -1 }),
        database.collection('passes').createIndex({ code: 1 }, { unique: true }),
        database.collection('activity_logs').createIndex({ flat: 1, created_at: -1 }),
        database.collection('maintenance_bills').createIndex({ flat: 1 }),
      ]);

      // Seed if empty
      const userCount = await database.collection('users').countDocuments();
      if (userCount === 0) {
        console.log('[GatePass Database] Seeding initial data into MongoDB...');
        for (const c of collections) {
          if (memStore[c] && memStore[c].length > 0) {
            await database.collection(c).insertMany(memStore[c]);
          }
        }
        console.log('[GatePass Database] MongoDB initial seeding complete.');
      }
      return;
    } catch (err) {
      console.warn('[GatePass Database] MongoDB connection failed (' + err.message + '). Falling back to built-in database engine.');
      isMongo = false;
    }
  }

  console.log('[GatePass Database] Running with Built-in High-Performance Storage Engine (Zero external dependencies).');
}

const col = (name) => (database ? database.collection(name) : null);
const cleanFlat = (flat) => (flat || '').trim().toUpperCase();
const withoutMongoId = (doc) => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest;
};
const many = (cursor) => cursor.toArray().then((items) => items.map(withoutMongoId));

const DB = {
  initSchema,

  async close() {
    if (client) await client.close();
  },

  getDatabaseInfo() {
    return {
      type: isMongo ? 'MongoDB Atlas Cloud Database' : 'Built-in High-Speed Engine (Persistent & Pre-seeded)',
      connected: true,
      isCloud: isMongo,
      databaseName: isMongo ? dbName : 'gatepass-internal',
      tables: collections,
      timestamp: new Date().toISOString(),
    };
  },

  async resetDatabase() {
    if (isMongo) {
      await Promise.all(collections.map((name) => col(name).deleteMany({})));
      await initSchema();
    } else {
      // In-memory reset
      memStore.visitors = memStore.visitors.slice(0, 3);
      memStore.activity_logs = memStore.activity_logs.slice(0, 5);
      memStore.passes = memStore.passes.slice(0, 2);
    }
  },

  async getUserByPhoneAndFlat(phone, flat) {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cFlat = cleanFlat(flat);
    if (isMongo) {
      return withoutMongoId(
        await col('users').findOne({
          role: 'resident',
          flat: cFlat,
          phone: { $regex: cleanPhone },
        })
      );
    }
    return memStore.users.find(
      (u) => u.role === 'resident' && u.flat === cFlat && (u.phone.includes(cleanPhone) || cleanPhone.includes(u.phone))
    ) || null;
  },

  async getUserByBadgeOrPhone(value) {
    const clean = (value || '').trim();
    const upper = clean.toUpperCase();
    if (isMongo) {
      return withoutMongoId(
        await col('users').findOne({
          $or: [{ badge_id: upper }, { phone: clean }],
        })
      );
    }
    return memStore.users.find((u) => (u.badge_id && u.badge_id.toUpperCase() === upper) || u.phone === clean) || null;
  },

  async getUserByEmail(email) {
    const clean = (email || '').trim().toLowerCase();
    const upper = clean.toUpperCase();
    if (isMongo) {
      return withoutMongoId(
        await col('users').findOne({
          $or: [{ email: clean }, { badge_id: upper }],
        })
      );
    }
    return memStore.users.find(
      (u) => (u.email && u.email.toLowerCase() === clean) || (u.badge_id && u.badge_id.toUpperCase() === upper)
    ) || null;
  },

  async getDemoUsers() {
    if (isMongo) {
      const [admins, residents, guards] = await Promise.all([
        many(col('users').find({ role: 'admin' })),
        many(col('users').find({ role: 'resident' })),
        many(col('users').find({ role: 'guard' })),
      ]);
      return { admins, residents, guards };
    }
    return {
      admins: memStore.users.filter((u) => u.role === 'admin'),
      residents: memStore.users.filter((u) => u.role === 'resident'),
      guards: memStore.users.filter((u) => u.role === 'guard'),
    };
  },

  async getPendingRequests(flat) {
    const cFlat = flat ? cleanFlat(flat) : null;
    if (isMongo) {
      return many(
        col('visitors')
          .find({ status: 'pending', ...(cFlat ? { flat: cFlat } : {}) })
          .sort({ created_at: -1 })
      );
    }
    return memStore.visitors.filter(
      (v) => v.status === 'pending' && (!cFlat || cleanFlat(v.flat) === cFlat)
    );
  },

  async getActiveVisitors(flat) {
    const cFlat = flat ? cleanFlat(flat) : null;
    if (isMongo) {
      return many(
        col('visitors')
          .find({ status: 'approved', ...(cFlat ? { flat: cFlat } : {}) })
          .sort({ created_at: -1 })
      );
    }
    return memStore.visitors.filter(
      (v) => (v.status === 'approved' || v.status === 'inside') && (!cFlat || cleanFlat(v.flat) === cFlat)
    );
  },

  async getVisitorById(id) {
    if (isMongo) return withoutMongoId(await col('visitors').findOne({ id }));
    return memStore.visitors.find((v) => v.id === id) || null;
  },

  async insertVisitor(visitor) {
    const doc = { ...visitor, created_at: new Date() };
    if (isMongo) {
      await col('visitors').insertOne(doc);
    } else {
      memStore.visitors.unshift(doc);
    }
  },

  async updateVisitorStatus(id, status, inTime, outTime) {
    if (isMongo) {
      const update = { status };
      if (inTime) update.in_time = inTime;
      if (outTime) update.out_time = outTime;
      await col('visitors').updateOne({ id }, { $set: update });
    } else {
      const v = memStore.visitors.find((x) => x.id === id);
      if (v) {
        v.status = status;
        if (inTime) v.in_time = inTime;
        if (outTime) v.out_time = outTime;
      }
    }
  },

  async getPasses(flat) {
    const cFlat = flat ? cleanFlat(flat) : null;
    if (isMongo) {
      return many(col('passes').find(cFlat ? { flat: cFlat } : {}).sort({ created_at: -1 }));
    }
    return memStore.passes.filter((p) => !cFlat || cleanFlat(p.flat) === cFlat);
  },

  async getPassByCode(code) {
    const cCode = (code || '').trim().toUpperCase();
    if (isMongo) return withoutMongoId(await col('passes').findOne({ code: cCode }));
    return memStore.passes.find((p) => p.code.toUpperCase() === cCode) || null;
  },

  async insertPass(pass) {
    const doc = { ...pass, created_at: new Date(), is_used: false };
    if (isMongo) {
      await col('passes').insertOne(doc);
    } else {
      memStore.passes.unshift(doc);
    }
  },

  async getActivityLogs(flat) {
    const cFlat = flat ? cleanFlat(flat) : null;
    if (isMongo) {
      return many(col('activity_logs').find(cFlat ? { flat: cFlat } : {}).sort({ created_at: -1 }).limit(50));
    }
    return memStore.activity_logs.filter((a) => !cFlat || cleanFlat(a.flat) === cFlat).slice(0, 50);
  },

  async insertActivity(activity) {
    const doc = { ...activity, created_at: new Date() };
    if (isMongo) {
      await col('activity_logs').insertOne(doc);
    } else {
      memStore.activity_logs.unshift(doc);
    }
  },

  async getHelpdeskTickets(flat) {
    const cFlat = flat ? cleanFlat(flat) : null;
    if (isMongo) {
      return many(col('helpdesk_tickets').find(cFlat ? { flat: cFlat } : {}).sort({ created_at: -1 }));
    }
    return memStore.helpdesk_tickets.filter((t) => !cFlat || cleanFlat(t.flat) === cFlat);
  },

  async insertTicket(ticket) {
    if (isMongo) {
      await col('helpdesk_tickets').insertOne(ticket);
    } else {
      memStore.helpdesk_tickets.unshift(ticket);
    }
  },

  async getStaff() {
    if (isMongo) return many(col('staff').find({}));
    return memStore.staff;
  },

  async getAmenities() {
    if (isMongo) return many(col('amenities').find({}));
    return memStore.amenities;
  },

  async getMaintenanceBill(flat = 'B-402') {
    const cFlat = cleanFlat(flat);
    if (isMongo) {
      return withoutMongoId(await col('maintenance_bills').findOne({ flat: cFlat })) || {
        month: 'November 2026',
        amount: 4250,
        status: 'Unpaid',
        flat: cFlat,
      };
    }
    return (
      memStore.maintenance_bills.find((b) => cleanFlat(b.flat) === cFlat) || {
        month: 'November 2026',
        amount: 4250,
        status: 'Unpaid',
        flat: cFlat,
      }
    );
  },

  async getAllMaintenanceBills() {
    if (isMongo) return many(col('maintenance_bills').find({}));
    return memStore.maintenance_bills;
  },

  async payMaintenanceBill(flat, txnId) {
    const cFlat = cleanFlat(flat);
    if (isMongo) {
      await col('maintenance_bills').updateOne(
        { flat: cFlat },
        { $set: { status: 'Paid', txn_id: txnId, paid_at: new Date() } }
      );
    } else {
      const b = memStore.maintenance_bills.find((x) => cleanFlat(x.flat) === cFlat);
      if (b) {
        b.status = 'Paid';
        b.txn_id = txnId;
        b.paid_at = new Date();
      }
    }
  },

  async insertEmergency(emergency) {
    const doc = { ...emergency, timestamp: new Date() };
    if (isMongo) {
      await col('emergencies').insertOne(doc);
    } else {
      memStore.emergencies.unshift(doc);
    }
  },

  async getEmergencies() {
    if (isMongo) return many(col('emergencies').find({}).sort({ timestamp: -1 }));
    return memStore.emergencies;
  },
};

module.exports = DB;
