const fs = require('fs');
const path = require('path');

let MongoClient;
try {
  MongoClient = require('mongodb').MongoClient;
} catch (e1) {
  try {
    MongoClient = require(path.join(__dirname, 'node_modules', 'mongodb')).MongoClient;
  } catch (e2) {
    MongoClient = require(path.join(__dirname, '..', 'node_modules', 'mongodb')).MongoClient;
  }
}

// Auto-load .env file if available
const serverEnv = path.join(__dirname, '.env');
const rootEnv = path.join(__dirname, '..', '.env');
if (fs.existsSync(serverEnv)) {
  try { process.loadEnvFile(serverEnv); } catch (e) {}
} else if (fs.existsSync(rootEnv)) {
  try { process.loadEnvFile(rootEnv); } catch (e) {}
}

// Official MongoDB Atlas Cloud Cluster for GatePass (dtdc_kudlu_gate)
const MONGODB_ATLAS_URI = 'mongodb://DTDC:nL9t9aL2t3p7GPrw@ac-ygjmiyk-shard-00-00.whrmpc4.mongodb.net:27017,ac-ygjmiyk-shard-00-01.whrmpc4.mongodb.net:27017,ac-ygjmiyk-shard-00-02.whrmpc4.mongodb.net:27017/dtdc_kudlu_gate?ssl=true&replicaSet=atlas-icmja0-shard-0&authSource=admin&retryWrites=true&w=majority';

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mongodb') ? process.env.DATABASE_URL : null) || MONGODB_ATLAS_URI;
const dbName = process.env.MONGODB_DB_NAME || 'dtdc_kudlu_gate';
const LOCAL_DB_PATH = path.join(__dirname, 'data', 'gatepass_db.json');

let client = null;
let database = null;
let isMongo = false;

// Initial Seed Data for Flats & Residents
const INITIAL_FLATS = [
  { id: 'flat-B402', flat: 'B-402', block: 'B', floor: '4th', owner: 'Vishwa (Resident Owner)', phone: '9876543210', email: 'vishwa@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Unpaid', duesAmount: 4250, vehicle: 'KA-05-MM-9214', intercom: '402', membersCount: 3, created_at: new Date().toISOString() },
  { id: 'flat-A104', flat: 'A-104', block: 'A', floor: '1st', owner: 'Pooja Malhotra', phone: '9811122233', email: 'pooja@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Unpaid', duesAmount: 3600, vehicle: 'KA-03-MG-4120', intercom: '104', membersCount: 2, created_at: new Date().toISOString() },
  { id: 'flat-C201', flat: 'C-201', block: 'C', floor: '2nd', owner: 'Dr. Alok Verma', phone: '9822233445', email: 'alok@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 4100, vehicle: 'KA-51-AB-8800', intercom: '201', membersCount: 4, created_at: new Date().toISOString() },
  { id: 'flat-A101', flat: 'A-101', block: 'A', floor: '1st', owner: 'Suresh Raina', phone: '9811100223', email: 'suresh@residence.com', status: 'Occupied', ownershipType: 'Tenant', dues: 'Paid', duesAmount: 3600, vehicle: 'KA-01-EE-3312', intercom: '101', membersCount: 3, created_at: new Date().toISOString() },
  { id: 'flat-A202', flat: 'A-202', block: 'A', floor: '2nd', owner: 'Meera Sen', phone: '9844001122', email: 'meera@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 3800, vehicle: 'KA-04-FF-1199', intercom: '202', membersCount: 2, created_at: new Date().toISOString() },
  { id: 'flat-B101', flat: 'B-101', block: 'B', floor: '1st', owner: 'Kunal Kapoor', phone: '9877002211', email: 'kunal@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 4250, vehicle: 'KA-02-HH-7788', intercom: '101', membersCount: 4, created_at: new Date().toISOString() },
  { id: 'flat-B201', flat: 'B-201', block: 'B', floor: '2nd', owner: 'R. K. Gupta', phone: '9833004455', email: 'rkgupta@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 4250, vehicle: 'KA-05-JK-9911', intercom: '201', membersCount: 3, created_at: new Date().toISOString() },
  { id: 'flat-C101', flat: 'C-101', block: 'C', floor: '1st', owner: 'Ananya Roy', phone: '9822005566', email: 'ananya@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 4100, vehicle: 'KA-03-LK-4433', intercom: '101', membersCount: 2, created_at: new Date().toISOString() },
  { id: 'flat-D301', flat: 'D-301', block: 'D', floor: '3rd', owner: 'T. N. Seshan', phone: '9811998877', email: 'seshan@residence.com', status: 'Occupied', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 4500, vehicle: 'KA-01-MM-5566', intercom: '301', membersCount: 2, created_at: new Date().toISOString() },
  { id: 'flat-D404', flat: 'D-404', block: 'D', floor: '4th', owner: 'Vacant (For Sale)', phone: '-', email: '', status: 'Vacant', ownershipType: 'Owner Occupied', dues: 'Paid', duesAmount: 0, vehicle: 'None', intercom: '404', membersCount: 0, created_at: new Date().toISOString() },
];

// In-Memory Storage Engine (Auto-saves to server/data/gatepass_db.json when running locally)
const memStore = {
  flats: [...INITIAL_FLATS],
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

// Local JSON File Persistence
function saveToFile() {
  if (isMongo) return;
  try {
    fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(memStore, null, 2), 'utf8');
  } catch (err) {
    console.warn('[GatePass Database] Could not persist to local JSON file:', err.message);
  }
}

function loadFromFile() {
  if (isMongo) return;
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
      for (const k of collections) {
        if (Array.isArray(data[k])) {
          memStore[k] = data[k];
        }
      }
      console.log(`[GatePass Database] Successfully loaded persistent local database (${memStore.flats.length} flats, ${memStore.users.length} users).`);
    } else {
      saveToFile();
    }
  } catch (err) {
    console.warn('[GatePass Database] Error loading local JSON file, using in-memory defaults:', err.message);
  }
}

async function initSchema() {
  if (uri) {
    try {
      console.log('[GatePass Database] Connecting to MongoDB Atlas / Cloud Cluster...');
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 0,
        connectTimeoutMS: 20000,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true,
      });

      client.on('error', (err) => {
        console.warn('[GatePass Database] MongoDB Pool Warning:', err.message);
      });
      await client.connect();
      database = client.db(dbName);
      isMongo = true;
      console.log(`[GatePass Database] Connected to MongoDB database "${dbName}" successfully!`);

      // Safely ensure indexes (ignore if already exists with legacy options)
      try {
        await Promise.allSettled([
          database.collection('users').createIndex({ email: 1 }, { sparse: true }),
          database.collection('users').createIndex({ role: 1, flat: 1 }),
          database.collection('flats').createIndex({ flat: 1 }),
          database.collection('users').createIndex({ badge_id: 1 }, { sparse: true }),
          database.collection('visitors').createIndex({ status: 1, flat: 1, created_at: -1 }),
          database.collection('passes').createIndex({ code: 1 }),
          database.collection('activity_logs').createIndex({ flat: 1, created_at: -1 }),
          database.collection('maintenance_bills').createIndex({ flat: 1 }),
        ]);
      } catch (idxErr) {
        console.log('[GatePass Database] Note: Using existing database indexes.');
      }

      // Seed any empty collection
      for (const c of collections) {
        if (memStore[c] && memStore[c].length > 0) {
          const count = await database.collection(c).countDocuments();
          if (count === 0) {
            await database.collection(c).insertMany(memStore[c].map(item => ({ ...item })));
            console.log(`[GatePass Database] Seeded ${memStore[c].length} default records into collection "${c}".`);
          }
        }
      }
      return;
    } catch (err) {
      console.warn('[GatePass Database] MongoDB connection failed (' + err.message + '). Falling back to built-in database engine.');
      isMongo = false;
    }
  }

  loadFromFile();
  console.log('[GatePass Database] Running with Persistent Built-in Storage Engine (File: server/data/gatepass_db.json)');
}

const col = (name) => (database ? database.collection(name) : null);
const cleanFlat = (flat) => (flat || '').trim().toUpperCase();
const cleanPhone = (phone) => (phone || '').replace(/\D/g, '');

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
      type: isMongo ? 'MongoDB Atlas Cloud Database' : 'Built-in High-Speed Engine (Persistent File Storage: server/data/gatepass_db.json)',
      connected: true,
      isCloud: isMongo,
      databaseName: isMongo ? dbName : 'gatepass_db.json',
      totalFlats: isMongo ? 'Dynamic' : memStore.flats.length,
      tables: collections,
      timestamp: new Date().toISOString(),
    };
  },

  // ==================== FLATS & RESIDENT MANAGEMENT ====================
  async getAllFlats() {
    if (isMongo) {
      return many(col('flats').find({}).sort({ flat: 1 }));
    }
    return [...memStore.flats];
  },

  async getFlatByNumber(flat) {
    const cFlat = cleanFlat(flat);
    if (isMongo) {
      return withoutMongoId(await col('flats').findOne({ flat: cFlat }));
    }
    return memStore.flats.find((f) => cleanFlat(f.flat) === cFlat) || null;
  },

  async getResidentByFlatAndPhone(flat, phone) {
    const cFlat = cleanFlat(flat);
    const digits = cleanPhone(phone);
    if (!cFlat || !digits) return null;

    if (isMongo) {
      // 1. Check flats collection
      const flatDoc = await col('flats').findOne({
        flat: cFlat,
        phone: { $regex: digits },
      });
      if (flatDoc) return withoutMongoId(flatDoc);

      // 2. Check users collection
      const userDoc = await col('users').findOne({
        role: 'resident',
        flat: cFlat,
        phone: { $regex: digits },
      });
      return withoutMongoId(userDoc);
    }

    // In-Memory / File store check
    const flatMatch = memStore.flats.find((f) => {
      if (cleanFlat(f.flat) !== cFlat) return false;
      const fPhone = cleanPhone(f.phone);
      return fPhone.includes(digits) || digits.includes(fPhone);
    });
    if (flatMatch) return flatMatch;

    return memStore.users.find((u) => {
      if (u.role !== 'resident' || cleanFlat(u.flat) !== cFlat) return false;
      const uPhone = cleanPhone(u.phone);
      return uPhone.includes(digits) || digits.includes(uPhone);
    }) || null;
  },

  // Society Admin: Onboard a New Resident Owner & Unit
  async addFlatResident(data) {
    const cFlat = cleanFlat(data.flat);
    if (!cFlat) throw new Error('Flat Number is required');
    if (!data.phone) throw new Error('Registered Phone Number is required');
    if (!data.owner) throw new Error('Resident Owner Name is required');

    const flatId = 'flat-' + cFlat.replace(/[^a-zA-Z0-9]/g, '');
    const userId = 'res-' + cFlat.replace(/[^a-zA-Z0-9]/g, '') + '-' + Date.now();

    const flatDoc = {
      id: flatId,
      flat: cFlat,
      block: (data.block || cFlat.split('-')[0] || 'A').toUpperCase(),
      floor: data.floor || '1st',
      owner: data.owner.trim(),
      phone: data.phone.trim(),
      email: (data.email || '').trim().toLowerCase(),
      status: data.status || 'Occupied',
      ownershipType: data.ownershipType || 'Owner Occupied',
      dues: data.dues || 'Unpaid',
      duesAmount: Number(data.duesAmount) || 4250,
      vehicle: (data.vehicle || 'None').trim().toUpperCase(),
      intercom: data.intercom || cFlat.replace(/\D/g, ''),
      membersCount: Number(data.membersCount) || 2,
      created_at: new Date().toISOString(),
    };

    const userDoc = {
      id: userId,
      name: `${flatDoc.owner} (Resident Owner)`,
      phone: flatDoc.phone,
      email: flatDoc.email || `${cFlat.toLowerCase()}@emeraldresidence.com`,
      role: 'resident',
      flat: cFlat,
      society: 'Emerald Heights Residency',
      ownershipType: flatDoc.ownershipType,
      created_at: new Date().toISOString(),
    };

    const billDoc = {
      id: 'bill-' + cFlat.toLowerCase(),
      flat: cFlat,
      month: 'November 2026',
      due_date: '15 Nov 2026',
      amount: flatDoc.duesAmount,
      status: flatDoc.dues,
      created_at: new Date(),
    };

    if (isMongo) {
      await col('flats').updateOne({ flat: cFlat }, { $set: flatDoc }, { upsert: true });
      await col('users').updateOne({ flat: cFlat, role: 'resident' }, { $set: userDoc }, { upsert: true });
      await col('maintenance_bills').updateOne({ flat: cFlat }, { $set: billDoc }, { upsert: true });
    } else {
      // Upsert in memStore
      const existingFlatIdx = memStore.flats.findIndex((f) => cleanFlat(f.flat) === cFlat);
      if (existingFlatIdx >= 0) {
        memStore.flats[existingFlatIdx] = { ...memStore.flats[existingFlatIdx], ...flatDoc };
      } else {
        memStore.flats.push(flatDoc);
      }

      const existingUserIdx = memStore.users.findIndex((u) => u.role === 'resident' && cleanFlat(u.flat) === cFlat);
      if (existingUserIdx >= 0) {
        memStore.users[existingUserIdx] = { ...memStore.users[existingUserIdx], ...userDoc };
      } else {
        memStore.users.push(userDoc);
      }

      const existingBillIdx = memStore.maintenance_bills.findIndex((b) => cleanFlat(b.flat) === cFlat);
      if (existingBillIdx >= 0) {
        memStore.maintenance_bills[existingBillIdx] = { ...memStore.maintenance_bills[existingBillIdx], ...billDoc };
      } else {
        memStore.maintenance_bills.push(billDoc);
      }

      saveToFile();
    }

    return flatDoc;
  },

  // Society Admin: Update Flat Resident Details
  async updateFlatResident(idOrFlat, updateData) {
    const cFlat = cleanFlat(idOrFlat);
    if (isMongo) {
      await col('flats').updateOne(
        { $or: [{ id: idOrFlat }, { flat: cFlat }] },
        { $set: { ...updateData, updated_at: new Date().toISOString() } }
      );
      if (updateData.owner || updateData.phone || updateData.email) {
        await col('users').updateOne(
          { flat: cFlat, role: 'resident' },
          {
            $set: {
              ...(updateData.owner ? { name: `${updateData.owner} (Resident Owner)` } : {}),
              ...(updateData.phone ? { phone: updateData.phone } : {}),
              ...(updateData.email ? { email: updateData.email } : {}),
            },
          }
        );
      }
    } else {
      const idx = memStore.flats.findIndex((f) => f.id === idOrFlat || cleanFlat(f.flat) === cFlat);
      if (idx >= 0) {
        memStore.flats[idx] = { ...memStore.flats[idx], ...updateData, updated_at: new Date().toISOString() };
        const uIdx = memStore.users.findIndex((u) => u.role === 'resident' && cleanFlat(u.flat) === cFlat);
        if (uIdx >= 0) {
          if (updateData.owner) memStore.users[uIdx].name = `${updateData.owner} (Resident Owner)`;
          if (updateData.phone) memStore.users[uIdx].phone = updateData.phone;
          if (updateData.email) memStore.users[uIdx].email = updateData.email;
        }
        saveToFile();
      }
    }
  },

  // Society Admin: Delete / Offboard Flat Resident
  async deleteFlatResident(idOrFlat) {
    const cFlat = cleanFlat(idOrFlat);
    if (isMongo) {
      await col('flats').deleteOne({ $or: [{ id: idOrFlat }, { flat: cFlat }] });
      await col('users').deleteMany({ flat: cFlat, role: 'resident' });
    } else {
      memStore.flats = memStore.flats.filter((f) => f.id !== idOrFlat && cleanFlat(f.flat) !== cFlat);
      memStore.users = memStore.users.filter((u) => !(u.role === 'resident' && cleanFlat(u.flat) === cFlat));
      saveToFile();
    }
  },

  // ==================== AUTH & USER QUERIES ====================
  async getUserByPhoneAndFlat(phone, flat) {
    return await this.getResidentByFlatAndPhone(flat, phone);
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

  // ==================== VISITOR REQUESTS ====================
  async getPendingRequests(flat = null) {
    const cFlat = flat ? cleanFlat(flat) : null;
    if (isMongo) {
      return many(
        col('visitors')
          .find(cFlat ? { status: 'pending', flat: cFlat } : { status: 'pending' })
          .sort({ created_at: -1 })
      );
    }
    return memStore.visitors.filter((v) => v.status === 'pending' && (!cFlat || cleanFlat(v.flat) === cFlat));
  },

  async getActiveVisitors(flat = null) {
    const cFlat = flat ? cleanFlat(flat) : null;
    if (isMongo) {
      return many(
        col('visitors')
          .find(cFlat ? { status: 'approved', flat: cFlat } : { status: 'approved' })
          .sort({ created_at: -1 })
      );
    }
    return memStore.visitors.filter((v) => v.status === 'approved' && (!cFlat || cleanFlat(v.flat) === cFlat));
  },

  async insertRequest(request) {
    const doc = {
      ...request,
      id: 'req-' + Date.now(),
      status: 'pending',
      created_at: new Date(),
    };
    if (isMongo) {
      await col('visitors').insertOne(doc);
    } else {
      memStore.visitors.unshift(doc);
      saveToFile();
    }
    return doc;
  },

  async insertVisitor(visitor) {
    const doc = {
      ...visitor,
      id: visitor.id || 'v-' + Date.now(),
      status: visitor.status || 'approved',
      created_at: visitor.created_at || new Date().toISOString(),
    };
    if (isMongo) {
      await col('visitors').insertOne(doc);
    } else {
      memStore.visitors.unshift(doc);
      saveToFile();
    }
    return doc;
  },

  async getVisitorById(id) {
    if (isMongo) return withoutMongoId(await col('visitors').findOne({ id }));
    return memStore.visitors.find((v) => v.id === id) || null;
  },

  async updateVisitorStatus(id, status, inTime = null, outTime = null, outTimeDisplay = null, duration = null) {
    const updates = { status };
    if (inTime) updates.in_time = inTime;
    if (outTime) updates.out_time = outTime;
    if (outTimeDisplay) updates.out_time_display = outTimeDisplay;
    if (duration) updates.duration = duration;

    if (isMongo) {
      await col('visitors').updateOne({ id }, { $set: updates });
    } else {
      const v = memStore.visitors.find((x) => x.id === id);
      if (v) {
        Object.assign(v, updates);
        saveToFile();
      }
    }
  },

  async getAllVisitors(filter = {}) {
    const { date, month, flat, search } = filter;
    let list = [];

    if (isMongo) {
      const query = {};
      if (flat) query.flat = cleanFlat(flat);
      if (date) query.date = date;
      else if (month) query.month = month;
      list = await many(col('visitors').find(query).sort({ created_at: -1 }));
    } else {
      list = memStore.visitors || [];
      if (date) {
        list = list.filter((v) => v.date === date || (v.created_at && v.created_at.startsWith(date)));
      }
      if (month) {
        list = list.filter((v) => v.month === month || (v.created_at && v.created_at.startsWith(month)));
      }
      if (flat) {
        const cFlat = cleanFlat(flat);
        list = list.filter((v) => cleanFlat(v.flat) === cFlat);
      }
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          (v.name && v.name.toLowerCase().includes(q)) ||
          (v.flat && v.flat.toLowerCase().includes(q)) ||
          (v.phone && v.phone.includes(q)) ||
          (v.vehicle && v.vehicle.toLowerCase().includes(q)) ||
          (v.purpose && v.purpose.toLowerCase().includes(q))
      );
    }
    return list;
  },

  async getRequestById(id) {
    if (isMongo) return withoutMongoId(await col('visitors').findOne({ id }));
    return memStore.visitors.find((v) => v.id === id) || null;
  },

  async approveRequest(id, leaveAtGate = false) {
    const inTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isMongo) {
      await col('visitors').updateOne(
        { id },
        { $set: { status: 'approved', leave_at_gate: leaveAtGate ? 1 : 0, in_time: inTime } }
      );
    } else {
      const v = memStore.visitors.find((x) => x.id === id);
      if (v) {
        v.status = 'approved';
        v.leave_at_gate = leaveAtGate ? 1 : 0;
        v.in_time = inTime;
        saveToFile();
      }
    }
  },

  async denyRequest(id) {
    if (isMongo) {
      await col('visitors').updateOne({ id }, { $set: { status: 'denied', out_time: new Date() } });
    } else {
      const v = memStore.visitors.find((x) => x.id === id);
      if (v) {
        v.status = 'denied';
        v.out_time = new Date();
        saveToFile();
      }
    }
  },

  async checkoutVisitor(id) {
    if (isMongo) {
      await col('visitors').updateOne({ id }, { $set: { status: 'checked_out', out_time: new Date() } });
    } else {
      const v = memStore.visitors.find((x) => x.id === id);
      if (v) {
        v.status = 'checked_out';
        v.out_time = new Date();
        saveToFile();
      }
    }
  },

  // ==================== PASSES ====================
  async getPasses(flat = null) {
    const cFlat = flat ? cleanFlat(flat) : null;
    if (isMongo) {
      return many(col('passes').find(cFlat ? { flat: cFlat } : {}).sort({ created_at: -1 }));
    }
    return memStore.passes.filter((p) => !cFlat || cleanFlat(p.flat) === cFlat);
  },

  async insertPass(pass) {
    const doc = { ...pass, created_at: new Date() };
    if (isMongo) {
      await col('passes').insertOne(doc);
    } else {
      memStore.passes.unshift(doc);
      saveToFile();
    }
    return doc;
  },

  async verifyPass(code) {
    const cCode = (code || '').trim().toUpperCase();
    if (isMongo) {
      const pass = await col('passes').findOne({ code: cCode, is_used: { $ne: true } });
      if (pass) {
        await col('passes').updateOne({ code: cCode }, { $set: { is_used: true, used_at: new Date() } });
        return withoutMongoId(pass);
      }
      return null;
    }
    const p = memStore.passes.find((x) => x.code === cCode && !x.is_used);
    if (p) {
      p.is_used = true;
      p.used_at = new Date();
      saveToFile();
      return p;
    }
    return null;
  },

  // ==================== ACTIVITY & HELPDESK ====================
  async getActivityLogs(flat = null) {
    const cFlat = flat ? cleanFlat(flat) : null;
    if (isMongo) {
      return many(
        col('activity_logs')
          .find(cFlat ? { flat: cFlat } : {})
          .sort({ created_at: -1 })
          .limit(30)
      );
    }
    return memStore.activity_logs.filter((a) => !cFlat || cleanFlat(a.flat) === cFlat).slice(0, 30);
  },

  async insertActivity(activity) {
    const doc = { ...activity, created_at: new Date() };
    if (isMongo) {
      await col('activity_logs').insertOne(doc);
    } else {
      memStore.activity_logs.unshift(doc);
      saveToFile();
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
      saveToFile();
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

  // ==================== MAINTENANCE ====================
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
      await col('flats').updateOne(
        { flat: cFlat },
        { $set: { dues: 'Paid' } }
      );
    } else {
      const b = memStore.maintenance_bills.find((x) => cleanFlat(x.flat) === cFlat);
      if (b) {
        b.status = 'Paid';
        b.txn_id = txnId;
        b.paid_at = new Date();
      }
      const f = memStore.flats.find((x) => cleanFlat(x.flat) === cFlat);
      if (f) {
        f.dues = 'Paid';
      }
      saveToFile();
    }
  },

  async insertEmergency(emergency) {
    const doc = { ...emergency, timestamp: new Date() };
    if (isMongo) {
      await col('emergencies').insertOne(doc);
    } else {
      memStore.emergencies.unshift(doc);
      saveToFile();
    }
  },

  async getEmergencies() {
    if (isMongo) return many(col('emergencies').find({}).sort({ timestamp: -1 }));
    return memStore.emergencies;
  },
};

module.exports = DB;
