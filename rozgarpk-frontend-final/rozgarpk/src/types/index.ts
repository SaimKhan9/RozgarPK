export type UserRole = 'client' | 'worker';

export type JobStatus = 'open' | 'in-progress' | 'completed' | 'closed';

export type DurationType = '1day' | '2-3days' | '1week' | '2weeks' | '1month' | '3months' | '6months' | 'full-project';

export type PaymentType = 'per-day' | 'per-hour' | 'weekly' | 'monthly' | 'fixed' | 'negotiable';

export type Category =
  | 'home-services'
  | 'electronics'
  | 'automobile'
  | 'education'
  | 'delivery'
  | 'daily-labour'
  | 'domestic'
  | 'outdoor'
  | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  area: string;
  avatar: string;
  createdAt: string;
}

export interface WorkerProfile {
  userId: string;
  category: Category;
  subCategory: string;
  skills: string[];
  ratePerDay: number;
  ratePerHour?: number;
  ratePerMonth?: number;
  experience: number;
  bio: string;
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  totalJobsDone: number;
  licenseType?: string;
  hasOwnVehicle?: boolean;
  vehicleModel?: string;
  workPhotos: string[];
}

export interface Worker extends User {
  profile: WorkerProfile;
}

export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  category: Category;
  subCategory: string;
  budget: number;
  budgetMax?: number;
  paymentType: PaymentType;
  duration: DurationType;
  city: string;
  area: string;
  isUrgent: boolean;
  status: JobStatus;
  imageUrl?: string;
  proposals: number;
  views: number;
  createdAt: string;
}

export interface Proposal {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  workerRating: number;
  workerReviews: number;
  quotedPrice: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  sentAt: string;
  isRead?: boolean;
}

export interface ChatRoom {
  id: string;
  jobId?: string;
  jobTitle: string;
  clientId: string;
  workerId: string;
  otherUserId: string;
  otherUserRole: UserRole;
  otherUserPhone?: string;
  workerName: string;
  workerAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  messages: Message[];
}

export interface Review {
  id: string;
  jobId: string;
  clientId: string;
  clientName: string;
  workerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
