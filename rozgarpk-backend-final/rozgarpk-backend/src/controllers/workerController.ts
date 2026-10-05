import { Request, Response } from 'express';
import { query } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest, WorkerProfileBody } from '../types';

const mapWorker = (row: Record<string, any>) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  role: row.role,
  city: row.city || '',
  area: row.area || '',
  avatar: row.avatar_url || '',
  createdAt: row.created_at,
  profile: {
    userId: row.id,
    category: row.category,
    subCategory: row.sub_category,
    skills: row.skills || [],
    ratePerDay: Number(row.rate_per_day || 0),
    ratePerHour: row.rate_per_hour == null ? undefined : Number(row.rate_per_hour),
    ratePerMonth: row.rate_per_month == null ? undefined : Number(row.rate_per_month),
    experience: row.experience || 0,
    bio: row.bio || '',
    isAvailable: row.is_available,
    rating: Number(row.rating || 0),
    totalReviews: row.total_reviews || 0,
    totalJobsDone: row.total_jobs_done || 0,
    licenseType: row.license_type,
    hasOwnVehicle: row.has_own_vehicle,
    vehicleModel: row.vehicle_model,
    isVerified: row.is_verified,
    workPhotos: row.work_photos || [],
  },
});

export const getWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, city, minRating, maxRate, search } = req.query as Record<string, string>;
    const filters = ['u.role = $1', 'u.is_active = TRUE'];
    const params: unknown[] = ['worker'];
    const addFilter = (sql: string, value: unknown) => {
      params.push(value);
      filters.push(sql.replace('?', `$${params.length}`));
    };
    if (category) addFilter('wp.category = ?', category);
    if (city) addFilter('u.city ILIKE ?', `%${city}%`);
    if (minRating) addFilter('wp.rating >= ?', Number(minRating));
    if (maxRate) addFilter('wp.rate_per_day <= ?', Number(maxRate));
    if (search) {
      params.push(`%${search}%`);
      const index = params.length;
      filters.push(`(u.name ILIKE $${index} OR wp.sub_category ILIKE $${index} OR array_to_string(wp.skills, ' ') ILIKE $${index})`);
    }
    const result = await query(
      `SELECT u.*, wp.category, wp.sub_category, wp.skills, wp.rate_per_day,
              wp.rate_per_hour, wp.rate_per_month, wp.experience, wp.bio, wp.is_available,
              wp.rating, wp.total_reviews, wp.total_jobs_done, wp.license_type,
              wp.has_own_vehicle, wp.vehicle_model, wp.is_verified AS profile_verified,
              wp.work_photos
       FROM users u INNER JOIN worker_profiles wp ON wp.user_id = u.id
       WHERE ${filters.join(' AND ')} ORDER BY wp.rating DESC, u.created_at DESC`,
      params
    );
    const workers = result.rows.map((row) => mapWorker({ ...row, is_verified: row.profile_verified }));
    sendSuccess(res, { workers, total: workers.length, page: 1, pages: 1 });
  } catch (error) {
    console.error('GetWorkers error:', error);
    sendError(res, 'Could not fetch workers', 500);
  }
};

export const getWorkerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT u.*, wp.category, wp.sub_category, wp.skills, wp.rate_per_day,
              wp.rate_per_hour, wp.rate_per_month, wp.experience, wp.bio, wp.is_available,
              wp.rating, wp.total_reviews, wp.total_jobs_done, wp.license_type,
              wp.has_own_vehicle, wp.vehicle_model, wp.is_verified AS profile_verified,
              wp.work_photos
       FROM users u INNER JOIN worker_profiles wp ON wp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'worker' AND u.is_active = TRUE`,
      [id]
    );
    if (!result.rows[0]) {
      sendError(res, 'Worker profile not found', 404);
      return;
    }
    const worker = mapWorker({ ...result.rows[0], is_verified: result.rows[0].profile_verified });
    sendSuccess(res, { ...worker, reviews: [] });
  } catch (error) {
    console.error('GetWorkerById error:', error);
    sendError(res, 'Could not fetch worker', 500);
  }
};

export const createWorkerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'worker') {
      sendError(res, 'Only workers can create a profile', 403);
      return;
    }

    const {
      category, subCategory, skills, ratePerDay, ratePerHour,
      ratePerMonth, experience, bio, licenseType, hasOwnVehicle, vehicleModel,
      city, area,
    } = req.body as WorkerProfileBody & { city?: string; area?: string };

    if (!category || !ratePerDay) {
      sendError(res, 'Category and rate per day are required', 400);
      return;
    }

    const userId = req.user.userId;

    if (city || area) {
      await query(
        `UPDATE users SET city = COALESCE($1, city), area = COALESCE($2, area), updated_at = NOW() WHERE id = $3`,
        [city || null, area || null, userId]
      );
    }

    const result = await query(
      `INSERT INTO worker_profiles
        (user_id, category, sub_category, skills, rate_per_day, rate_per_hour, rate_per_month,
         experience, bio, license_type, has_own_vehicle, vehicle_model)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (user_id) DO UPDATE SET
         category = EXCLUDED.category, sub_category = EXCLUDED.sub_category,
         skills = EXCLUDED.skills, rate_per_day = EXCLUDED.rate_per_day,
         rate_per_hour = EXCLUDED.rate_per_hour, rate_per_month = EXCLUDED.rate_per_month,
         experience = EXCLUDED.experience, bio = EXCLUDED.bio, license_type = EXCLUDED.license_type,
         has_own_vehicle = EXCLUDED.has_own_vehicle, vehicle_model = EXCLUDED.vehicle_model,
         updated_at = NOW()
       RETURNING *`,
      [userId, category, subCategory || 'General', Array.isArray(skills) ? skills : [], Number(ratePerDay),
        ratePerHour ? Number(ratePerHour) : null, ratePerMonth ? Number(ratePerMonth) : null,
        Number(experience || 0), bio || '', licenseType || null, Boolean(hasOwnVehicle), vehicleModel || null]
    );
    const row = result.rows[0];
    sendSuccess(res, {
      userId, category: row.category, subCategory: row.sub_category, skills: row.skills,
      ratePerDay: Number(row.rate_per_day), ratePerHour: row.rate_per_hour == null ? undefined : Number(row.rate_per_hour),
      ratePerMonth: row.rate_per_month == null ? undefined : Number(row.rate_per_month), experience: row.experience,
      bio: row.bio, isAvailable: row.is_available, rating: Number(row.rating), totalReviews: row.total_reviews,
      totalJobsDone: row.total_jobs_done, isVerified: row.is_verified, workPhotos: row.work_photos,
      licenseType: row.license_type, hasOwnVehicle: row.has_own_vehicle, vehicleModel: row.vehicle_model,
    }, 'Worker profile saved', 201);
  } catch (error) {
    console.error('CreateWorkerProfile error:', error);
    sendError(res, 'Could not save worker profile', 500);
  }
};

export const toggleAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      'UPDATE worker_profiles SET is_available = NOT is_available, updated_at = NOW() WHERE user_id = $1 RETURNING is_available',
      [req.user?.userId]
    );
    if (!result.rows[0]) {
      sendError(res, 'Worker profile not found', 404);
      return;
    }

    const isAvailable = result.rows[0].is_available;
    sendSuccess(res, { isAvailable }, `Worker status updated to ${isAvailable ? 'available' : 'busy'}`);
  } catch (error) {
    console.error('ToggleAvailability error:', error);
    sendError(res, 'Could not update availability', 500);
  }
};
