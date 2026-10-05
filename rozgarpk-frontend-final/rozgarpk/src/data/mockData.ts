import type { Worker, Job, Proposal, Review, Category } from '../types';

export const CATEGORIES: { id: Category; label: string; icon: string; count: number }[] = [
  { id: 'home-services',  label: 'Home Services',        icon: '🏠', count: 2400 },
  { id: 'electronics',    label: 'Electronics & Computer',icon: '💻', count: 890  },
  { id: 'automobile',     label: 'Automobile',            icon: '🚗', count: 650  },
  { id: 'education',      label: 'Education & Tutor',     icon: '📚', count: 1100 },
  { id: 'delivery',       label: 'Delivery & Moving',     icon: '🚚', count: 780  },
  { id: 'daily-labour',   label: 'Daily Labour',          icon: '👷', count: 3200 },
  { id: 'domestic',       label: 'Domestic Help',         icon: '🍳', count: 960  },
  { id: 'outdoor',        label: 'Outdoor & Misc',        icon: '🌿', count: 420  },
  { id: 'driver',         label: 'Driver Service',        icon: '🚘', count: 530  },
];

export const SUBCATEGORIES: Record<Category, string[]> = {
  'home-services': ['Plumber', 'Electrician', 'Painter', 'Carpenter', 'Cleaner', 'Mason', 'Welder'],
  'electronics':   ['Computer/Laptop', 'Mobile Repair', 'TV Repair', 'AC/Fridge', 'UPS/Solar', 'CCTV/Networking'],
  'automobile':    ['Car Mechanic', 'Car Wash', 'Tyre/Puncture', 'Car Electrician', 'Bike Mechanic'],
  'education':     ['School Tutor', 'O/A Level Tutor', 'Quran Teacher', 'Computer Tutor', 'Language Teacher'],
  'delivery':      ['Home Shifting', 'Courier/Parcel', 'Grocery Delivery', 'Loading/Unloading', 'Document Delivery'],
  'daily-labour':  ['General Labour', 'Mason', 'Plaster Worker', 'Tile Worker', 'Roof Slab', 'Excavation', 'Labour Contractor'],
  'domestic':      ['Cook', 'Baby Sitter', 'Elder Care', 'Driver', 'Maid'],
  'outdoor':       ['Gardener', 'Pest Control', 'Water Tank Cleaning', 'Tailor', 'Cobbler'],
  'driver':        ['With Own Car', 'Driver Only', 'Tour/Trip Driver', 'Office Duty Driver'],
};

export const CITIES = ['Islamabad', 'Karachi', 'Lahore', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'];

export const mockWorkers: Worker[] = [
  {
    id: 'w1', name: 'Usman Ali', email: 'usman@example.com',
    phone: '0300-1234567', role: 'worker', city: 'Islamabad', area: 'G-11',
    avatar: '👨‍🔧', createdAt: '2023-01-15',
    profile: {
      userId: 'w1', category: 'home-services', subCategory: 'Electrician',
      skills: ['Wiring', 'AC Install', 'AC Repair', 'Fan Fitting', 'MCB/Fuse', 'Solar Wiring'],
      ratePerDay: 1500, ratePerHour: 300, experience: 5,
      bio: 'I have been doing electrical work in Islamabad for 5 years. Experienced in both residential and commercial projects. Specialise in AC installation and repair. Same-day service available for urgent cases.',
      isVerified: true, isAvailable: true, rating: 4.9, totalReviews: 87, totalJobsDone: 87,
      workPhotos: ['⚡', '🔌', '❄️'],
    },
  },
  {
    id: 'w2', name: 'Sana Malik', email: 'sana@example.com',
    phone: '0301-2345678', role: 'worker', city: 'Karachi', area: 'Gulshan',
    avatar: '👩‍🏫', createdAt: '2023-03-10',
    profile: {
      userId: 'w2', category: 'education', subCategory: 'School Tutor',
      skills: ['Matric Math', 'Physics', 'Chemistry', 'Home Visit', 'Online'],
      ratePerDay: 800, ratePerMonth: 5000, experience: 3,
      bio: 'Experienced math and science tutor with 3 years of teaching Matric and O-Level students. Home visits available across Karachi. Results-focused teaching style.',
      isVerified: true, isAvailable: true, rating: 4.8, totalReviews: 52, totalJobsDone: 52,
      workPhotos: ['📚', '✏️', '📐'],
    },
  },
  {
    id: 'w3', name: 'Bilal Ahmed', email: 'bilal@example.com',
    phone: '0302-3456789', role: 'worker', city: 'Lahore', area: 'Johar Town',
    avatar: '🔧', createdAt: '2022-06-20',
    profile: {
      userId: 'w3', category: 'home-services', subCategory: 'Plumber',
      skills: ['Pipe Repair', 'Bathroom Fitting', 'Water Tank', 'Leak Fix'],
      ratePerDay: 1200, ratePerHour: 250, experience: 7,
      bio: 'Professional plumber with 7 years of experience. Specialise in leak repairs, bathroom installations, and water tank cleaning. Available for urgent same-day calls.',
      isVerified: false, isAvailable: true, rating: 4.2, totalReviews: 31, totalJobsDone: 31,
      workPhotos: ['🚿', '🪠', '💧'],
    },
  },
  {
    id: 'w4', name: 'Hamza Tech', email: 'hamza@example.com',
    phone: '0303-4567890', role: 'worker', city: 'Rawalpindi', area: 'Saddar',
    avatar: '🖥️', createdAt: '2022-01-05',
    profile: {
      userId: 'w4', category: 'electronics', subCategory: 'Computer/Laptop',
      skills: ['Laptop Repair', 'Mobile Screen', 'Software Install', 'Data Recovery', 'Networking'],
      ratePerDay: 2000, ratePerHour: 800, experience: 6,
      bio: 'Expert in computer and mobile repair with 6 years experience. Handle all laptop brands, mobile screens, and software issues. Home service available.',
      isVerified: true, isAvailable: true, rating: 4.9, totalReviews: 143, totalJobsDone: 143,
      workPhotos: ['💻', '📱', '🖱️'],
    },
  },
  {
    id: 'w5', name: 'Tariq Hussain', email: 'tariq@example.com',
    phone: '0304-5678901', role: 'worker', city: 'Rawalpindi', area: 'Satellite Town',
    avatar: '🧑‍✈️', createdAt: '2021-08-12',
    profile: {
      userId: 'w5', category: 'driver', subCategory: 'With Own Car',
      skills: ['Long Route', 'Family Trip', 'Airport Drop', 'Daily Routine'],
      ratePerDay: 2800, ratePerMonth: 60000, experience: 8,
      bio: 'Professional driver with 8 years experience. I have my own Toyota Corolla. Available for daily duty, family trips, and long routes. Heavy license holder.',
      isVerified: true, isAvailable: true, rating: 4.9, totalReviews: 64, totalJobsDone: 64,
      licenseType: 'Heavy', hasOwnVehicle: true, vehicleModel: 'Toyota Corolla 2019',
      workPhotos: ['🚗', '🛣️', '🗺️'],
    },
  },
  {
    id: 'w6', name: 'Shahid Khan', email: 'shahid@example.com',
    phone: '0305-6789012', role: 'worker', city: 'Islamabad', area: 'G-13',
    avatar: '🧱', createdAt: '2020-04-18',
    profile: {
      userId: 'w6', category: 'daily-labour', subCategory: 'Mason',
      skills: ['Brick Work', 'Plaster', 'Block Wall', 'Foundation', 'Roof Slab'],
      ratePerDay: 2200, experience: 10,
      bio: 'Experienced mason with 10 years in construction. Can provide a full team of 4 (mason + 3 helpers). Available for house construction, renovations, and individual tasks.',
      isVerified: true, isAvailable: true, rating: 4.9, totalReviews: 73, totalJobsDone: 73,
      workPhotos: ['🧱', '🏗️', '🏠'],
    },
  },
  {
    id: 'w7', name: 'Rashid Mechanic', email: 'rashid@example.com',
    phone: '0306-7890123', role: 'worker', city: 'Lahore', area: 'Faisal Town',
    avatar: '🚗', createdAt: '2019-11-30',
    profile: {
      userId: 'w7', category: 'automobile', subCategory: 'Car Mechanic',
      skills: ['Engine Repair', 'Brakes', 'AC Repair', 'Electrical', 'Home Visit'],
      ratePerDay: 2000, ratePerHour: 500, experience: 10,
      bio: 'Car and bike mechanic with 10 years experience. Handle all brands. Home visit service available. Transparent pricing with no hidden costs.',
      isVerified: false, isAvailable: true, rating: 4.3, totalReviews: 68, totalJobsDone: 68,
      workPhotos: ['🔧', '🚗', '⚙️'],
    },
  },
  {
    id: 'w8', name: 'Nasreen Bibi', email: 'nasreen@example.com',
    phone: '0307-8901234', role: 'worker', city: 'Islamabad', area: 'F-7',
    avatar: '🍳', createdAt: '2021-02-14',
    profile: {
      userId: 'w8', category: 'domestic', subCategory: 'Cook',
      skills: ['Desi Food', 'Event Cooking', 'Daily Meals', 'Baking'],
      ratePerDay: 1800, ratePerMonth: 45000, experience: 8,
      bio: 'Experienced home cook specialising in Pakistani cuisine. Available for daily cooking, events, and functions. Trusted by over 29 families in Islamabad.',
      isVerified: true, isAvailable: true, rating: 4.9, totalReviews: 29, totalJobsDone: 29,
      workPhotos: ['🍛', '🍖', '🥘'],
    },
  },
];

export const mockJobs: Job[] = [
  {
    id: 'j1', clientId: 'c1', clientName: 'Ahmed Raza',
    title: 'Bathroom Pipe Leak Needs Fixing',
    description: 'Main bathroom pipe is leaking badly. Need it fixed today — urgent. Pipe is under the sink.',
    category: 'home-services', subCategory: 'Plumber',
    budget: 2000, budgetMax: 3500, paymentType: 'fixed',
    duration: '1day', city: 'Islamabad', area: 'G-10',
    isUrgent: true, status: 'open', proposals: 3, views: 24,
    createdAt: '2024-09-25T10:00:00Z',
  },
  {
    id: 'j2', clientId: 'c2', clientName: 'Sara Khan',
    title: 'Matric Math & Science Tutor Needed',
    description: 'My son is in Matric and needs help with Math and Physics. Home visit preferred, twice a week.',
    category: 'education', subCategory: 'School Tutor',
    budget: 6000, paymentType: 'monthly',
    duration: '3months', city: 'Karachi', area: 'Gulshan',
    isUrgent: false, status: 'open', proposals: 6, views: 41,
    createdAt: '2024-09-24T14:00:00Z',
  },
  {
    id: 'j3', clientId: 'c3', clientName: 'Tariq Mehmood',
    title: 'Dell Laptop Screen Replacement',
    description: 'Laptop screen is cracked. Need original screen replacement — home visit preferred.',
    category: 'electronics', subCategory: 'Computer/Laptop',
    budget: 4500, budgetMax: 7000, paymentType: 'fixed',
    duration: '1day', city: 'Lahore', area: 'Johar Town',
    isUrgent: false, status: 'open', proposals: 4, views: 18,
    createdAt: '2024-09-24T09:00:00Z',
  },
  {
    id: 'j4', clientId: 'c4', clientName: 'Fatima Noor',
    title: 'Driver Needed for 3 Days — With Own Car',
    description: 'Need an experienced driver with his own car for a family trip — Islamabad to Murree and back.',
    category: 'driver', subCategory: 'With Own Car',
    budget: 6000, budgetMax: 9000, paymentType: 'per-day',
    duration: '2-3days', city: 'Islamabad', area: 'F-8',
    isUrgent: true, status: 'open', proposals: 2, views: 15,
    createdAt: '2024-09-25T08:00:00Z',
  },
  {
    id: 'j5', clientId: 'c5', clientName: 'Khalid Hassan',
    title: 'Roof Slab Work — 5 Workers Needed',
    description: 'Need to pour a roof slab for new house. Require 5 workers and 1 mason — 3 days of work. Materials provided by client.',
    category: 'daily-labour', subCategory: 'Roof Slab',
    budget: 1500, paymentType: 'per-day',
    duration: '2-3days', city: 'Islamabad', area: 'G-13',
    isUrgent: true, status: 'open', proposals: 5, views: 32,
    createdAt: '2024-09-23T11:00:00Z',
  },
  {
    id: 'j6', clientId: 'c6', clientName: 'Zara Ahmed',
    title: 'AC Gas Refill Needed',
    description: '1.5 ton AC gas is empty. Need someone to come home and refill it today.',
    category: 'home-services', subCategory: 'Electrician',
    budget: 3000, paymentType: 'fixed',
    duration: '1day', city: 'Lahore', area: 'DHA',
    isUrgent: true, status: 'open', proposals: 2, views: 11,
    createdAt: '2024-09-25T07:00:00Z',
  },
];

export const mockProposals: Proposal[] = [
  {
    id: 'p1', jobId: 'j1', workerId: 'w3',
    workerName: 'Bilal Ahmed', workerAvatar: '🔧',
    workerRating: 4.2, workerReviews: 31, quotedPrice: 2500,
    message: 'I can fix this today. Rs 2,500 includes labour only, parts extra if needed.',
    status: 'pending', createdAt: '2024-09-25T10:30:00Z',
  },
  {
    id: 'p2', jobId: 'j2', workerId: 'w2',
    workerName: 'Sana Malik', workerAvatar: '👩‍🏫',
    workerRating: 4.8, workerReviews: 52, quotedPrice: 5500,
    message: 'I can start from next week, twice a week sessions. Rs 5,500/month.',
    status: 'pending', createdAt: '2024-09-24T15:00:00Z',
  },
];

export const mockReviews: Record<string, Review[]> = {
  w1: [
    { id: 'rv1', jobId: 'j1', clientId: 'c1', clientName: 'Ahmed R.', workerId: 'w1', rating: 5, comment: 'Excellent work, arrived on time and did a perfect job. Installed my AC for Rs. 1,500.', createdAt: '2024-09-01' },
    { id: 'rv2', jobId: 'j2', clientId: 'c2', clientName: 'Sara K.', workerId: 'w1', rating: 5, comment: 'It was urgent and he arrived in 2 hours. Wiring problem solved. Highly recommended!', createdAt: '2024-08-20' },
    { id: 'rv3', jobId: 'j3', clientId: 'c3', clientName: 'Tariq M.', workerId: 'w1', rating: 4, comment: 'Good work, arrived a bit late but overall satisfied. Will call again.', createdAt: '2024-08-10' },
  ],
};
