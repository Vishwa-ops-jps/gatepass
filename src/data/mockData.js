export const initialPendingRequests = [
  {
    id: 'req-1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    type: 'Guest',
    category: 'guest',
    vehicle: 'KA-03-MG-4120',
    gate: 'Main Gate 1',
    time: 'Just now',
    purpose: 'Visiting Flat B-402',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    status: 'pending',
  },
  {
    id: 'req-2',
    name: 'Mukesh Kumar (Zomato)',
    phone: '+91 91234 56789',
    type: 'Delivery',
    category: 'delivery',
    vendor: 'Zomato',
    gate: 'Service Gate 2',
    time: '2 mins ago',
    purpose: 'Food Delivery - Prepaid',
    image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    status: 'pending',
  },
];

export const initialRecentActivity = [
  {
    id: 'act-1',
    name: 'Sunita Devi',
    role: 'House Maid',
    category: 'staff',
    time: 'Today, 08:30 AM',
    gate: 'Main Gate 1',
    action: 'Checked In',
    status: 'approved',
  },
  {
    id: 'act-2',
    name: 'Uber (Swift Dzire - KA-01-AB-1234)',
    role: 'Cab / Taxi',
    category: 'cab',
    time: 'Today, 09:15 AM',
    gate: 'Main Gate 1',
    action: 'Allowed Entry',
    status: 'approved',
  },
  {
    id: 'act-3',
    name: 'Amazon Courier Partner',
    role: 'Delivery',
    category: 'delivery',
    time: 'Yesterday, 04:45 PM',
    gate: 'Gate 2 (Parcel Desk)',
    action: 'Left at Security',
    status: 'completed',
  },
  {
    id: 'act-4',
    name: 'Dr. Alok Verma',
    role: 'Guest',
    category: 'guest',
    time: 'Yesterday, 07:10 PM',
    gate: 'Main Gate 1',
    action: 'Checked Out',
    status: 'completed',
  },
];

export const dailyStaffList = [
  {
    id: 'staff-1',
    name: 'Sunita Devi',
    role: 'Housekeeping / Maid',
    rating: '4.9 ★',
    phone: '+91 98220 11223',
    status: 'Inside Society',
    entryTime: '08:30 AM',
    flatsWorked: '6 Flats',
  },
  {
    id: 'staff-2',
    name: 'Ramesh Patel',
    role: 'Car Cleaner & Driver',
    rating: '4.8 ★',
    phone: '+91 97334 22119',
    status: 'Inside Society',
    entryTime: '06:45 AM',
    flatsWorked: '4 Flats',
  },
  {
    id: 'staff-3',
    name: 'Anjali Rawat',
    role: 'Cook & Chef',
    rating: '5.0 ★',
    phone: '+91 94112 88440',
    status: 'Expected at 06:00 PM',
    entryTime: '-',
    flatsWorked: '3 Flats',
  },
];

export const amenitiesList = [
  {
    id: 'am-1',
    name: 'Clubhouse Banquet Hall',
    capacity: '150 People',
    timing: '09:00 AM - 11:00 PM',
    status: 'Available',
    price: '₹2,500 / slot',
    icon: 'home',
  },
  {
    id: 'am-2',
    name: 'Olympic Swimming Pool',
    capacity: '30 People',
    timing: '06:00 AM - 09:00 PM',
    status: 'Open Today',
    price: 'Free for Residents',
    icon: 'water',
  },
  {
    id: 'am-3',
    name: 'Floodlit Tennis Court',
    capacity: '4 Players',
    timing: '06:00 AM - 10:00 PM',
    status: 'Slots Open',
    price: '₹150 / hr',
    icon: 'tennisball',
  },
  {
    id: 'am-4',
    name: 'Fitness & Cardio Gym',
    capacity: '25 People',
    timing: '05:30 AM - 10:30 PM',
    status: 'Open Today',
    price: 'Free for Residents',
    icon: 'barbell',
  },
];

export const communityNotices = [
  {
    id: 'not-1',
    title: 'Elevator Maintenance in Block B',
    date: 'Nov 05, 2026',
    tag: 'Notice',
    desc: 'Scheduled service between 11:00 AM to 02:00 PM. Please use Lift #2 during this period.',
  },
  {
    id: 'not-2',
    title: 'Diwali Celebration & Cultural Night',
    date: 'Nov 08, 2026',
    tag: 'Event',
    desc: 'Gather at the Central Lawn at 06:30 PM. Music, dinner & performances.',
  },
];

export const initialMaintenanceBill = {
  month: 'November 2026',
  dueDate: '15 Nov 2026',
  amount: 4250,
  status: 'Unpaid',
  breakdown: [
    { title: 'Society Maintenance Charge', amount: 3200 },
    { title: 'Sinking Fund', amount: 500 },
    { title: 'Water & Common Utility', amount: 450 },
    { title: 'Clubhouse Subscription', amount: 100 },
  ],
};

