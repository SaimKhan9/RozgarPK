import { Response } from 'express';
import { query } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest, CreateProposalBody } from '../types';

// POST /api/proposals — Worker applies to a job
export const createProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId, quotedPrice, message } = req.body as CreateProposalBody;
    const workerId = req.user?.userId;

    if (!jobId || !quotedPrice || !message) {
      sendError(res, 'Job ID, quoted price, and message are required', 400);
      return;
    }

    // Check job exists and is open
    const job = await query(
      'SELECT id, status, client_id FROM jobs WHERE id = $1',
      [jobId]
    );

    if (job.rows.length === 0) {
      sendError(res, 'Job not found', 404);
      return;
    }

    if (job.rows[0].status !== 'open') {
      sendError(res, 'This job is no longer accepting proposals', 400);
      return;
    }

    if (job.rows[0].client_id === workerId) {
      sendError(res, 'You cannot apply to your own job', 400);
      return;
    }

    // Insert proposal
    const result = await query(
      `INSERT INTO proposals (job_id, worker_id, quoted_price, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [jobId, workerId, quotedPrice, message]
    );

    // Increment proposals count on the job
    await query(
      'UPDATE jobs SET proposals = proposals + 1 WHERE id = $1',
      [jobId]
    );

    sendSuccess(res, result.rows[0], 'Proposal submitted successfully', 201);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      sendError(res, 'You have already applied to this job', 409);
      return;
    }
    console.error('CreateProposal error:', err);
    sendError(res, 'Could not submit proposal', 500);
  }
};

// GET /api/proposals/job/:jobId — Get all proposals for a job (client only)
export const getProposalsByJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    // Verify requester owns the job
    const job = await query(
      'SELECT client_id FROM jobs WHERE id = $1',
      [jobId]
    );

    if (job.rows.length === 0) {
      sendError(res, 'Job not found', 404);
      return;
    }

    if (job.rows[0].client_id !== req.user?.userId) {
      sendError(res, 'Not authorized to view these proposals', 403);
      return;
    }

    const result = await query(
      `SELECT p.*, u.name AS worker_name, u.avatar_url AS worker_avatar,
              wp.rating AS worker_rating, wp.total_reviews AS worker_reviews,
              wp.sub_category AS worker_skill
       FROM proposals p
       INNER JOIN users u ON u.id = p.worker_id
       LEFT JOIN worker_profiles wp ON wp.user_id = p.worker_id
       WHERE p.job_id = $1
       ORDER BY wp.rating DESC, p.created_at ASC`,
      [jobId]
    );

    sendSuccess(res, result.rows);
  } catch (err) {
    console.error('GetProposalsByJob error:', err);
    sendError(res, 'Could not fetch proposals', 500);
  }
};

// GET /api/proposals/my — Worker's own proposals
export const getMyProposals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT p.*, j.title AS job_title, j.budget AS job_budget,
              j.city AS job_city, j.status AS job_status,
              u.name AS client_name
       FROM proposals p
       INNER JOIN jobs j ON j.id = p.job_id
       INNER JOIN users u ON u.id = j.client_id
       WHERE p.worker_id = $1
       ORDER BY p.created_at DESC`,
      [req.user?.userId]
    );

    sendSuccess(res, result.rows);
  } catch (err) {
    console.error('GetMyProposals error:', err);
    sendError(res, 'Could not fetch your proposals', 500);
  }
};

// PATCH /api/proposals/:id — Accept or reject a proposal (client only)
export const updateProposalStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: 'accepted' | 'rejected' };

    if (!['accepted', 'rejected'].includes(status)) {
      sendError(res, 'Status must be accepted or rejected', 400);
      return;
    }

    // Check proposal + verify client owns the job
    const proposal = await query(
      `SELECT p.*, j.client_id FROM proposals p
       INNER JOIN jobs j ON j.id = p.job_id
       WHERE p.id = $1`,
      [id]
    );

    if (proposal.rows.length === 0) {
      sendError(res, 'Proposal not found', 404);
      return;
    }

    if (proposal.rows[0].client_id !== req.user?.userId) {
      sendError(res, 'Not authorized to update this proposal', 403);
      return;
    }

    const result = await query(
      'UPDATE proposals SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    // If accepted — update job status to in-progress and create chat room
    if (status === 'accepted') {
      await query(
        "UPDATE jobs SET status = 'in-progress' WHERE id = $1",
        [proposal.rows[0].job_id]
      );

      // Auto-create chat room between client and worker
      await query(
        `INSERT INTO chat_rooms (job_id, client_id, worker_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (job_id, client_id, worker_id) DO NOTHING`,
        [proposal.rows[0].job_id, req.user?.userId, proposal.rows[0].worker_id]
      );
    }

    sendSuccess(res, result.rows[0], `Proposal ${status}`);
  } catch (err) {
    console.error('UpdateProposalStatus error:', err);
    sendError(res, 'Could not update proposal', 500);
  }
};
