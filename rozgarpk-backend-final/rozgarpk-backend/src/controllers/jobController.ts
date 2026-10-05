import { Request, Response } from 'express';
import { query } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest, CreateJobBody } from '../types';

const mapJob = (job: Record<string, any>) => ({
  id: job.id,
  clientId: job.client_id,
  clientName: job.client_name || '',
  title: job.title,
  description: job.description,
  category: job.category,
  subCategory: job.sub_category,
  budget: Number(job.budget),
  budgetMax: job.budget_max == null ? undefined : Number(job.budget_max),
  paymentType: job.payment_type,
  duration: job.duration,
  city: job.city || '',
  area: job.area || '',
  isUrgent: job.is_urgent,
  status: job.status,
  imageUrl: job.image_url || '',
  proposals: Number(job.proposals || 0),
  views: Number(job.views || 0),
  createdAt: job.created_at,
});

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, city, isUrgent, status = 'open', search } = req.query as Record<string, string>;
    const filters = ['j.status = $1'];
    const params: unknown[] = [status || 'open'];
    const addFilter = (sql: string, value: unknown) => {
      params.push(value);
      filters.push(sql.replace('?', `$${params.length}`));
    };
    if (category) addFilter('j.category = ?', category);
    if (city) addFilter('j.city ILIKE ?', `%${city}%`);
    if (isUrgent === 'true') addFilter('j.is_urgent = ?', true);
    if (search) {
      params.push(`%${search}%`);
      const index = params.length;
      filters.push(`(j.title ILIKE $${index} OR j.description ILIKE $${index} OR j.sub_category ILIKE $${index})`);
    }

    const result = await query(
      `SELECT j.*, u.name AS client_name FROM jobs j
       INNER JOIN users u ON u.id = j.client_id
       WHERE ${filters.join(' AND ')} ORDER BY j.created_at DESC`,
      params
    );
    const jobs = result.rows.map(mapJob);
    sendSuccess(res, { jobs, total: jobs.length, page: 1, pages: 1 });
  } catch (error) {
    console.error('GetJobs error:', error);
    sendError(res, 'Could not fetch jobs', 500);
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await query('UPDATE jobs SET views = views + 1 WHERE id = $1 RETURNING id', [id]);
    if (!updated.rows[0]) {
      sendError(res, 'Job not found', 404);
      return;
    }
    const result = await query(
      `SELECT j.*, u.name AS client_name FROM jobs j INNER JOIN users u ON u.id = j.client_id WHERE j.id = $1`,
      [id]
    );
    sendSuccess(res, mapJob(result.rows[0]));
  } catch (error) {
    console.error('GetJobById error:', error);
    sendError(res, 'Could not fetch job', 500);
  }
};

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title, description, category, subCategory,
      budget, budgetMax, paymentType, duration,
      city, area, isUrgent, imageUrl,
    } = req.body as CreateJobBody;

    if (!req.user || req.user.role !== 'client') {
      sendError(res, 'Only clients can post jobs. If you are registered as a worker, please switch to a client account.', 403);
      return;
    }

    if (!title || !description || !category || !budget) {
      sendError(res, 'Title, description, category and budget are required', 400);
      return;
    }

    const result = await query(
      `INSERT INTO jobs (client_id, title, description, category, sub_category, budget, budget_max,
                         payment_type, duration, city, area, is_urgent, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *, (SELECT name FROM users WHERE id = client_id) AS client_name`,
      [req.user.userId, String(title).trim(), String(description).trim(), category, subCategory || 'General',
        Number(budget), budgetMax ? Number(budgetMax) : null, paymentType || 'fixed', duration || '1day',
        city || 'Islamabad', area || '', Boolean(isUrgent), imageUrl || '']
    );
    sendSuccess(res, mapJob(result.rows[0]), 'Job posted successfully', 201);
  } catch (error) {
    console.error('CreateJob error:', error);
    sendError(res, 'Could not post job', 500);
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT client_id FROM jobs WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      sendError(res, 'Job not found', 404);
      return;
    }

    if (existing.rows[0].client_id !== req.user?.userId) {
      sendError(res, 'Not authorized to update this job', 403);
      return;
    }

    const body = req.body as Partial<{ title: string; description: string; budget: number; budgetMax: number; isUrgent: boolean; status: string }>;
    const fields: Record<string, string> = { title: 'title', description: 'description', budget: 'budget', budgetMax: 'budget_max', isUrgent: 'is_urgent', status: 'status' };
    const assignments: string[] = [];
    const params: unknown[] = [];
    for (const [key, column] of Object.entries(fields)) {
      if (body[key as keyof typeof body] !== undefined) {
        params.push(body[key as keyof typeof body]);
        assignments.push(`${column} = $${params.length}`);
      }
    }
    if (!assignments.length) {
      sendError(res, 'No supported fields to update', 400);
      return;
    }
    params.push(id);
    const result = await query(
      `UPDATE jobs SET ${assignments.join(', ')}, updated_at = NOW() WHERE id = $${params.length}
       RETURNING *, (SELECT name FROM users WHERE id = client_id) AS client_name`,
      params
    );
    sendSuccess(res, mapJob(result.rows[0]), 'Job updated successfully');
  } catch (error) {
    console.error('UpdateJob error:', error);
    sendError(res, 'Could not update job', 500);
  }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT client_id FROM jobs WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      sendError(res, 'Job not found', 404);
      return;
    }

    if (existing.rows[0].client_id !== req.user?.userId) {
      sendError(res, 'Not authorized to delete this job', 403);
      return;
    }

    await query('DELETE FROM jobs WHERE id = $1', [id]);
    sendSuccess(res, null, 'Job deleted successfully');
  } catch (error) {
    console.error('DeleteJob error:', error);
    sendError(res, 'Could not delete job', 500);
  }
};

export const getMyJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT j.*, u.name AS client_name FROM jobs j
       INNER JOIN users u ON u.id = j.client_id WHERE j.client_id = $1 ORDER BY j.created_at DESC`,
      [req.user?.userId]
    );
    const jobs = result.rows.map(mapJob);
    sendSuccess(res, jobs);
  } catch (error) {
    console.error('GetMyJobs error:', error);
    sendError(res, 'Could not fetch your jobs', 500);
  }
};
