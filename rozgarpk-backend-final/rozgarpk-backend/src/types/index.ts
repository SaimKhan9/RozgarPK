import { Request } from 'express';

export type UserRole = 'client' | 'worker' | 'admin';

export type JobStatus = 'open' | 'in-progress' | 'completed' | 'closed';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

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

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface RegisterBody {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  city: string;
  area: string;
}

export interface LoginBody {
  email: string;
  password: string;
  role?: UserRole;
}

export interface WorkerProfileBody {
  category: Category;
  subCategory: string;
  skills: string[];
  ratePerDay: number;
  ratePerHour?: number;
  ratePerMonth?: number;
  experience: number;
  bio: string;
  licenseType?: string;
  hasOwnVehicle?: boolean;
  vehicleModel?: string;
}

export interface CreateJobBody {
  title: string;
  description: string;
  category: Category;
  subCategory: string;
  budget: number;
  budgetMax?: number;
  paymentType: string;
  duration: string;
  city: string;
  area: string;
  isUrgent: boolean;
}

export interface CreateProposalBody {
  jobId: string;
  quotedPrice: number;
  message: string;
}

export interface CreateReviewBody {
  jobId: string;
  workerId: string;
  rating: number;
  comment: string;
}

export interface SendMessageBody {
  roomId: string;
  text: string;
}
