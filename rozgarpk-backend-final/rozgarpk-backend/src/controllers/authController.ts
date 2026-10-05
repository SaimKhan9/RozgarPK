import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest, RegisterBody, LoginBody } from '../types';
import { query } from '../config/db';

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizePhone = (value: string) => value.replace(/\D/g, '');
const mapUser = (user: Record<string, any>) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  city: user.city || '',
  area: user.area || '',
  avatarUrl: user.avatar_url || '',
  isActive: user.is_active,
  isVerified: user.is_verified,
  createdAt: user.created_at,
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role, city, area } = req.body as RegisterBody;

    if (!name || !email || !phone || !password || !role) {
      sendError(res, 'Please provide all required fields', 400);
      return;
    }

    const cleanName = String(name).trim();
    const cleanEmail = normalizeEmail(String(email));
    const cleanPhone = String(phone).trim();
    const passwordText = String(password);

    if (cleanName.length < 2) {
      sendError(res, 'Name must be at least 2 characters', 400);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      sendError(res, 'Please provide a valid email address', 400);
      return;
    }

    const phoneRegex = /^03\d{2}-?\d{7}$/;
    if (!phoneRegex.test(cleanPhone)) {
      sendError(res, 'Phone must be a valid Pakistani number like 0300-1234567', 400);
      return;
    }

    const passwordOk = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(passwordText);
    if (!passwordOk) {
      sendError(res, 'Password must be at least 8 chars, include uppercase, number and special character', 400);
      return;
    }

    const passwordHash = await bcrypt.hash(passwordText, 12);
    const result = await query(
      `INSERT INTO users (name, email, phone, password_hash, role, city, area, avatar_url, is_active, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, '', TRUE, FALSE)
       RETURNING *`,
      [cleanName, cleanEmail, cleanPhone, passwordHash, role, city || 'Islamabad', area || '']
    );
    const userRecord = result.rows[0];
    const user = mapUser(userRecord);
    const token = generateToken({ userId: userRecord.id, role: userRecord.role, email: userRecord.email });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      sendError(res, 'A user with this email or phone already exists', 409);
      return;
    }
    console.error('Register error:', error);
    sendError(res, 'Registration failed. Please try again.', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
      sendError(res, 'Please provide email and password', 400);
      return;
    }

    const cleanEmail = normalizeEmail(String(email));
    const result = await query(
      `SELECT * FROM users
       WHERE LOWER(email) = $1 OR REPLACE(phone, '-', '') = REPLACE($2, '-', '')
       LIMIT 1`,
      [cleanEmail, cleanEmail]
    );
    const userRecord = result.rows[0];

    if (!userRecord) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    if (!userRecord.is_active) {
      sendError(res, 'Your account has been deactivated', 401);
      return;
    }

    const isMatch = await bcrypt.compare(String(password), userRecord.password_hash);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [userRecord.id]);

    const user = mapUser(userRecord);
    const token = generateToken({ userId: userRecord.id, role: userRecord.role, email: userRecord.email });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', 500);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Not authorized', 401);
      return;
    }

    const result = await query(
      `SELECT u.*, wp.category AS profile_category, wp.sub_category AS profile_sub_category,
              wp.skills AS profile_skills, wp.rate_per_day AS profile_rate_per_day,
              wp.rate_per_hour AS profile_rate_per_hour, wp.rate_per_month AS profile_rate_per_month,
              wp.experience AS profile_experience, wp.bio AS profile_bio,
              wp.is_available AS profile_is_available, wp.rating AS profile_rating,
              wp.total_reviews AS profile_total_reviews, wp.total_jobs_done AS profile_total_jobs_done,
              wp.license_type AS profile_license_type, wp.has_own_vehicle AS profile_has_own_vehicle,
              wp.vehicle_model AS profile_vehicle_model, wp.is_verified AS profile_is_verified,
              wp.work_photos AS profile_work_photos
       FROM users u LEFT JOIN worker_profiles wp ON wp.user_id = u.id
       WHERE u.id = $1`,
      [req.user.userId]
    );
    const userRecord = result.rows[0];

    if (!userRecord) {
      sendError(res, 'User not found', 404);
      return;
    }

    const profile = userRecord.profile_category ? {
      userId: userRecord.id,
      category: userRecord.profile_category,
      subCategory: userRecord.profile_sub_category,
      skills: userRecord.profile_skills || [],
      ratePerDay: Number(userRecord.profile_rate_per_day || 0),
      ratePerHour: userRecord.profile_rate_per_hour == null ? undefined : Number(userRecord.profile_rate_per_hour),
      ratePerMonth: userRecord.profile_rate_per_month == null ? undefined : Number(userRecord.profile_rate_per_month),
      experience: userRecord.profile_experience || 0,
      bio: userRecord.profile_bio || '',
      isAvailable: userRecord.profile_is_available,
      rating: Number(userRecord.profile_rating || 0),
      totalReviews: userRecord.profile_total_reviews || 0,
      totalJobsDone: userRecord.profile_total_jobs_done || 0,
      licenseType: userRecord.profile_license_type,
      hasOwnVehicle: userRecord.profile_has_own_vehicle,
      vehicleModel: userRecord.profile_vehicle_model,
      isVerified: userRecord.profile_is_verified,
      workPhotos: userRecord.profile_work_photos || [],
    } : undefined;
    const payload = {
      ...mapUser(userRecord),
      ...(profile ? { profile } : {}),
    };

    sendSuccess(res, payload, 'User fetched');
  } catch (error) {
    console.error('GetMe error:', error);
    sendError(res, 'Could not fetch current user', 500);
  }
};

export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, city, area, currentPassword } = req.body as {
      name?: string; email?: string; phone?: string; city?: string; area?: string; currentPassword?: string;
    };
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user?.userId]);
    const userRecord = result.rows[0];

    if (!userRecord) {
      sendError(res, 'Account not found', 404);
      return;
    }

    const cleanName = String(name || '').trim();
    const cleanEmail = normalizeEmail(String(email || ''));
    const phoneDigits = normalizePhone(String(phone || ''));
    const cleanCity = String(city || '').trim();
    const cleanArea = String(area || '').trim();

    if (cleanName.length < 2) {
      sendError(res, 'Name must be at least 2 characters', 400);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      sendError(res, 'Please provide a valid email address', 400);
      return;
    }
    if (!/^03\d{9}$/.test(phoneDigits)) {
      sendError(res, 'Phone must be a valid Pakistani number, for example 0300-1234567', 400);
      return;
    }
    if (!cleanCity) {
      sendError(res, 'City is required', 400);
      return;
    }

    const emailChanged = cleanEmail !== userRecord.email.toLowerCase();
    if (emailChanged && !currentPassword) {
      sendError(res, 'Enter your current password to change your email', 400);
      return;
    }
    if (emailChanged && !await bcrypt.compare(String(currentPassword), userRecord.password_hash)) {
      sendError(res, 'Current password is incorrect', 400);
      return;
    }

    const updated = await query(
      `UPDATE users SET name = $1, email = $2, phone = $3, city = $4, area = $5
       WHERE id = $6 RETURNING *`,
      [cleanName, cleanEmail, `${phoneDigits.slice(0, 4)}-${phoneDigits.slice(4)}`, cleanCity, cleanArea, userRecord.id]
    );
    const updatedUser = mapUser(updated.rows[0]);
    const token = generateToken({ userId: updated.rows[0].id, role: updated.rows[0].role, email: updated.rows[0].email });
    sendSuccess(res, { user: updatedUser, token }, 'Profile updated successfully');
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      sendError(res, 'That email or phone number is already in use', 409);
      return;
    }
    console.error('UpdateMe error:', error);
    sendError(res, 'Could not update profile', 500);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  sendSuccess(res, null, 'Logged out successfully');
};
