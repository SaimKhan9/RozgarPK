import { Response } from 'express';
import { query } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest } from '../types';

export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [userStats, jobStats, proposalStats, reviewStats, messageStats, topCities, topCategories] = await Promise.all([
      query(`
        SELECT 
          COUNT(*)::int AS total_users,
          COUNT(*) FILTER (WHERE role = 'worker')::int AS workers,
          COUNT(*) FILTER (WHERE role = 'client')::int AS clients,
          COUNT(*) FILTER (WHERE role = 'admin')::int AS admins,
          COUNT(*) FILTER (WHERE is_verified = true)::int AS verified_users,
          COUNT(*) FILTER (WHERE is_active = true)::int AS active_users
        FROM users
      `),
      query(`
        SELECT 
          COUNT(*)::int AS total_jobs,
          COUNT(*) FILTER (WHERE status = 'open')::int AS open_jobs,
          COUNT(*) FILTER (WHERE status = 'in-progress')::int AS in_progress_jobs,
          COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_jobs,
          COUNT(*) FILTER (WHERE status = 'closed')::int AS closed_jobs,
          COALESCE(SUM(budget), 0)::numeric AS total_budget
        FROM jobs
      `),
      query(`
        SELECT 
          COUNT(*)::int AS total_proposals,
          COUNT(*) FILTER (WHERE status = 'accepted')::int AS accepted_proposals,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_proposals
        FROM proposals
      `),
      query(`
        SELECT 
          COUNT(*)::int AS total_reviews,
          ROUND(COALESCE(AVG(rating), 0)::numeric, 1) AS avg_rating
        FROM reviews
      `),
      query(`
        SELECT COUNT(*)::int AS total_messages FROM messages
      `),
      query(`
        SELECT city, COUNT(*)::int AS count
        FROM users
        WHERE city IS NOT NULL AND city != ''
        GROUP BY city
        ORDER BY count DESC
        LIMIT 5
      `),
      query(`
        SELECT category, COUNT(*)::int AS count
        FROM worker_profiles
        WHERE category IS NOT NULL AND category != ''
        GROUP BY category
        ORDER BY count DESC
        LIMIT 6
      `),
    ]);

    sendSuccess(res, {
      users: userStats.rows[0] || {},
      jobs: jobStats.rows[0] || {},
      proposals: proposalStats.rows[0] || {},
      reviews: reviewStats.rows[0] || {},
      messages: messageStats.rows[0] || {},
      topCities: topCities.rows || [],
      topCategories: topCategories.rows || [],
    }, 'Admin statistics fetched');
  } catch (error) {
    console.error('getAdminStats error:', error);
    sendError(res, 'Failed to fetch admin stats', 500);
  }
};

export const getAdminUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, search, page = '1', limit = '50' } = req.query as {
      role?: string;
      search?: string;
      page?: string;
      limit?: string;
    };

    let sql = `
      SELECT id, name, email, phone, role, city, area, is_verified, is_active, created_at, last_login_at
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];

    if (role && role !== 'all') {
      params.push(role);
      sql += ` AND role = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR phone LIKE $${params.length} OR LOWER(city) LIKE $${params.length})`;
    }

    sql += ` ORDER BY created_at DESC`;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    params.push(parsedLimit, offset);
    sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await query(sql, params);
    sendSuccess(res, result.rows, 'Users fetched');
  } catch (error) {
    console.error('getAdminUsers error:', error);
    sendError(res, 'Failed to fetch users', 500);
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive, isVerified, role } = req.body as {
      isActive?: boolean;
      isVerified?: boolean;
      role?: string;
    };

    const updates: string[] = [];
    const params: any[] = [id];

    if (isActive !== undefined) {
      params.push(Boolean(isActive));
      updates.push(`is_active = $${params.length}`);
    }

    if (isVerified !== undefined) {
      params.push(Boolean(isVerified));
      updates.push(`is_verified = $${params.length}`);
    }

    if (role && ['client', 'worker', 'admin'].includes(role)) {
      params.push(role);
      updates.push(`role = $${params.length}`);
    }

    if (updates.length === 0) {
      sendError(res, 'No valid status fields provided', 400);
      return;
    }

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = $1 RETURNING id, name, email, role, is_active, is_verified`;
    const result = await query(sql, params);

    if (!result.rows[0]) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'User updated');
  } catch (error) {
    console.error('updateUserStatus error:', error);
    sendError(res, 'Failed to update user', 500);
  }
};

export const deleteAdminUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (id === req.user?.userId) {
      sendError(res, 'You cannot delete your own admin account', 400);
      return;
    }

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id, name', [id]);
    if (!result.rows[0]) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, { id }, 'User deleted');
  } catch (error) {
    console.error('deleteAdminUser error:', error);
    sendError(res, 'Failed to delete user', 500);
  }
};

export const getAdminWorkers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, category } = req.query as { search?: string; category?: string };

    let sql = `
      SELECT 
        wp.id, wp.user_id, wp.category, wp.sub_category, wp.skills,
        wp.rate_per_day, wp.rate_per_hour, wp.experience, wp.bio,
        wp.is_available, wp.rating, wp.total_reviews, wp.total_jobs_done,
        wp.is_verified AS profile_verified,
        u.name, u.email, u.phone, u.city, u.area, u.is_verified AS user_verified, u.is_active,
        wp.created_at
      FROM worker_profiles wp
      JOIN users u ON u.id = wp.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND wp.category = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(u.name) LIKE $${params.length} OR LOWER(u.city) LIKE $${params.length} OR LOWER(wp.category) LIKE $${params.length})`;
    }

    sql += ` ORDER BY wp.created_at DESC`;

    const result = await query(sql, params);
    sendSuccess(res, result.rows, 'Workers fetched');
  } catch (error) {
    console.error('getAdminWorkers error:', error);
    sendError(res, 'Failed to fetch workers', 500);
  }
};

export const toggleWorkerVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // worker_profile id or user_id
    const { isVerified } = req.body as { isVerified: boolean };

    const targetVerified = Boolean(isVerified);

    const wpRes = await query(
      `UPDATE worker_profiles SET is_verified = $1 WHERE id = $2 OR user_id = $2 RETURNING user_id, is_verified`,
      [targetVerified, id]
    );

    if (!wpRes.rows[0]) {
      sendError(res, 'Worker profile not found', 404);
      return;
    }

    // Also sync users table is_verified
    await query(`UPDATE users SET is_verified = $1 WHERE id = $2`, [targetVerified, wpRes.rows[0].user_id]);

    sendSuccess(res, { id, isVerified: targetVerified }, 'Worker verification status updated');
  } catch (error) {
    console.error('toggleWorkerVerification error:', error);
    sendError(res, 'Failed to update verification', 500);
  }
};

export const getAdminJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, category, search } = req.query as {
      status?: string;
      category?: string;
      search?: string;
    };

    let sql = `
      SELECT 
        j.id, j.title, j.description, j.category, j.budget, j.budget_max,
        j.payment_type, j.duration, j.city, j.area, j.is_urgent, j.status,
        j.proposals, j.views, j.created_at,
        u.id AS client_id, u.name AS client_name, u.email AS client_email, u.phone AS client_phone
      FROM jobs j
      JOIN users u ON u.id = j.client_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND j.status = $${params.length}`;
    }

    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND j.category = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(j.title) LIKE $${params.length} OR LOWER(j.city) LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length})`;
    }

    sql += ` ORDER BY j.created_at DESC`;

    const result = await query(sql, params);
    sendSuccess(res, result.rows, 'Jobs fetched');
  } catch (error) {
    console.error('getAdminJobs error:', error);
    sendError(res, 'Failed to fetch jobs', 500);
  }
};

export const updateJobStatusAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };

    if (!['open', 'in-progress', 'completed', 'closed'].includes(status)) {
      sendError(res, 'Invalid status', 400);
      return;
    }

    const result = await query(
      `UPDATE jobs SET status = $1 WHERE id = $2 RETURNING id, title, status`,
      [status, id]
    );

    if (!result.rows[0]) {
      sendError(res, 'Job not found', 404);
      return;
    }

    sendSuccess(res, result.rows[0], 'Job status updated');
  } catch (error) {
    console.error('updateJobStatusAdmin error:', error);
    sendError(res, 'Failed to update job status', 500);
  }
};

export const deleteJobAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM jobs WHERE id = $1 RETURNING id, title`, [id]);
    if (!result.rows[0]) {
      sendError(res, 'Job not found', 404);
      return;
    }
    sendSuccess(res, { id }, 'Job deleted');
  } catch (error) {
    console.error('deleteJobAdmin error:', error);
    sendError(res, 'Failed to delete job', 500);
  }
};

export const getAdminAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [jobsByDay, jobsByCategory, workersByCategory, topCities, usersGrowth] = await Promise.all([
      query(`
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
        FROM jobs
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY day ASC
      `),
      query(`
        SELECT category, COUNT(*)::int AS count
        FROM jobs
        GROUP BY category
        ORDER BY count DESC
      `),
      query(`
        SELECT category, COUNT(*)::int AS count
        FROM worker_profiles
        GROUP BY category
        ORDER BY count DESC
      `),
      query(`
        SELECT city, COUNT(*)::int AS count
        FROM users
        WHERE city IS NOT NULL AND city != ''
        GROUP BY city
        ORDER BY count DESC
        LIMIT 6
      `),
      query(`
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY day ASC
      `),
    ]);

    sendSuccess(res, {
      jobsByDay: jobsByDay.rows,
      jobsByCategory: jobsByCategory.rows,
      workersByCategory: workersByCategory.rows,
      topCities: topCities.rows,
      usersGrowth: usersGrowth.rows,
    }, 'Analytics fetched');
  } catch (error) {
    console.error('getAdminAnalytics error:', error);
    sendError(res, 'Failed to fetch analytics', 500);
  }
};

export const claimAdminRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { secret } = req.body as { secret: string };
    const validSecret = process.env.ADMIN_SECRET || 'rozgarpk-admin-2025';

    if (secret !== validSecret) {
      sendError(res, 'Invalid admin passkey', 403);
      return;
    }

    await query(`UPDATE users SET role = 'admin' WHERE id = $1`, [req.user?.userId]);
    sendSuccess(res, { role: 'admin' }, 'Successfully granted admin role');
  } catch (error) {
    console.error('claimAdminRole error:', error);
    sendError(res, 'Failed to grant admin role', 500);
  }
};
