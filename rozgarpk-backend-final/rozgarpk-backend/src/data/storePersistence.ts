import fs from 'fs';
import path from 'path';

export type UserRole = 'client' | 'worker' | 'admin';

export interface StoreUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  city: string;
  area: string;
  avatarUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface StoreWorkerProfile {
  userId: string;
  category: string;
  subCategory: string;
  skills: string[];
  ratePerDay: number;
  ratePerHour?: number;
  ratePerMonth?: number;
  experience: number;
  bio: string;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  totalJobsDone: number;
  isVerified: boolean;
  workPhotos: string[];
  licenseType?: string;
  hasOwnVehicle?: boolean;
  vehicleModel?: string;
}

export interface StoreJob {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  subCategory: string;
  budget: number;
  budgetMax?: number;
  paymentType: string;
  duration: string;
  city: string;
  area: string;
  isUrgent: boolean;
  status: 'open' | 'in-progress' | 'completed' | 'closed';
  imageUrl?: string;
  proposalsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreChatRoom {
  id: string;
  clientId: string;
  workerId: string;
  jobId?: string;
  jobTitle: string;
  createdAt: string;
}

export interface StoreMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  sentAt: string;
  isRead: boolean;
}

export interface RozgarStore {
  users: StoreUser[];
  workerProfiles: StoreWorkerProfile[];
  jobs: StoreJob[];
  chatRooms: StoreChatRoom[];
  messages: StoreMessage[];
}

const filePath = path.join(process.cwd(), 'src', 'data', 'store.json');

export const createDefaultStore = (): RozgarStore => ({
  users: [],
  workerProfiles: [],
  jobs: [],
  chatRooms: [],
  messages: [],
});

const ensureStore = () => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(createDefaultStore(), null, 2), 'utf8');
  }
};

export const readStore = (): RozgarStore => {
  ensureStore();
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as RozgarStore;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      workerProfiles: Array.isArray(parsed.workerProfiles) ? parsed.workerProfiles : [],
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
      chatRooms: Array.isArray(parsed.chatRooms) ? parsed.chatRooms : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    };
  } catch {
    const fallback = createDefaultStore();
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
};

export const writeStore = (store: RozgarStore) => {
  ensureStore();
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf8');
};

export const sanitizeUser = (user: StoreUser) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const findUserByEmail = (email: string) => {
  const store = readStore();
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

export const findUserById = (id: string) => {
  const store = readStore();
  return store.users.find((user) => user.id === id);
};

export const nextId = () => {
  return `id_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
};