import { Request, Response } from 'express';
import { query } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest, CreateReviewBody } from '../types';

// GET /api/reviews/worker/:workerId — Get reviews for a worker
export const getWorkerReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;

    const result = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.name AS client_name, u.avatar_url AS client_avatar,
              j.title AS job_title
       FROM reviews r
       INNER JOIN users u ON u.id = r.client_id
       INNER JOIN jobs j ON j.id = r.job_id
       WHERE r.worker_id = $1
       ORDER BY r.created_at DESC`,
      [workerId]
    );

    // Avg rating summary
    const summary = await query(
      `SELECT
         COUNT(*) AS total,
         ROUND(AVG(rating)::numeric, 1) AS avg_rating,
         COUNT(*) FILTER (WHERE rating = 5) AS five_star,
         COUNT(*) FILTER (WHERE rating = 4) AS four_star,
         COUNT(*) FILTER (WHERE rating = 3) AS three_star,
         COUNT(*) FILTER (WHERE rating <= 2) AS low_star
       FROM reviews WHERE worker_id = $1`,
      [workerId]
    );

    sendSuccess(res, { reviews: result.rows, summary: summary.rows[0] });
  } catch (err) {
    console.error('GetWorkerReviews error:', err);
    sendError(res, 'Could not fetch reviews', 500);
  }
};

// POST /api/reviews — Leave a review (client only, after job completed)
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId, workerId, rating, comment } = req.body as CreateReviewBody;
    const clientId = req.user?.userId;

    if (!jobId || !workerId || !rating) {
      sendError(res, 'Job ID, worker ID, and rating are required', 400);
      return;
    }

    if (rating < 1 || rating > 5) {
      sendError(res, 'Rating must be between 1 and 5', 400);
      return;
    }

    // Check job is completed and client owns it
    const job = await query(
      'SELECT id, status, client_id FROM jobs WHERE id = $1',
      [jobId]
    );

    if (job.rows.length === 0) {
      sendError(res, 'Job not found', 404);
      return;
    }

    if (job.rows[0].client_id !== clientId) {
      sendError(res, 'You can only review workers from your own jobs', 403);
      return;
    }

    // Insert review
    const result = await query(
      `INSERT INTO reviews (job_id, client_id, worker_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [jobId, clientId, workerId, rating, comment]
    );

    // Update worker's average rating
    await query(
      `UPDATE worker_profiles SET
         rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE worker_id = $1),
         total_reviews = (SELECT COUNT(*) FROM reviews WHERE worker_id = $1),
         total_jobs_done = total_jobs_done + 1
       WHERE user_id = $1`,
      [workerId]
    );

    // Mark job as completed
    await query(
      "UPDATE jobs SET status = 'completed' WHERE id = $1",
      [jobId]
    );

    sendSuccess(res, result.rows[0], 'Review submitted successfully', 201);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      sendError(res, 'You have already reviewed this job', 409);
      return;
    }
    console.error('CreateReview error:', err);
    sendError(res, 'Could not submit review', 500);
  }
};
