import { Response } from 'express';
import { query } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest } from '../types';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Not authorized', 401);
      return;
    }

    const userRes = await query('SELECT id, name, role, city FROM users WHERE id = $1', [userId]);
    const currentUser = userRes.rows[0];
    if (!currentUser) {
      sendError(res, 'User not found', 404);
      return;
    }

    const notifications: Array<{
      id: string;
      type: 'proposal' | 'proposal_update' | 'message' | 'review' | 'job' | 'system';
      title: string;
      description: string;
      time: string;
      link: string;
      isUnread: boolean;
      avatar?: string;
    }> = [];

    // 1. If user is client -> fetch proposals on their jobs
    if (currentUser.role === 'client' || currentUser.role === 'admin') {
      const clientProposals = await query(
        `SELECT p.id, p.quoted_price, p.created_at, p.status,
                j.id AS job_id, j.title AS job_title,
                u.name AS worker_name, u.avatar_url AS worker_avatar
         FROM proposals p
         JOIN jobs j ON j.id = p.job_id
         JOIN users u ON u.id = p.worker_id
         WHERE j.client_id = $1
         ORDER BY p.created_at DESC
         LIMIT 10`,
        [userId]
      );

      for (const row of clientProposals.rows) {
        notifications.push({
          id: `prop-${row.id}`,
          type: 'proposal',
          title: `New Proposal from ${row.worker_name}`,
          description: `Offered Rs. ${Number(row.quoted_price).toLocaleString()} on your job "${row.job_title}"`,
          time: row.created_at,
          link: `/job/${row.job_id}`,
          isUnread: row.status === 'pending',
          avatar: row.worker_avatar,
        });
      }
    }

    // 2. If user is worker -> fetch proposals status updates
    if (currentUser.role === 'worker' || currentUser.role === 'admin') {
      const workerProposals = await query(
        `SELECT p.id, p.status, p.updated_at,
                j.id AS job_id, j.title AS job_title,
                u.name AS client_name
         FROM proposals p
         JOIN jobs j ON j.id = p.job_id
         JOIN users u ON u.id = j.client_id
         WHERE p.worker_id = $1 AND p.status IN ('accepted', 'rejected')
         ORDER BY p.updated_at DESC
         LIMIT 10`,
        [userId]
      );

      for (const row of workerProposals.rows) {
        const isAccepted = row.status === 'accepted';
        notifications.push({
          id: `prop-status-${row.id}`,
          type: 'proposal_update',
          title: isAccepted ? `🎉 Proposal Accepted!` : `Proposal Update`,
          description: isAccepted
            ? `${row.client_name} accepted your proposal for "${row.job_title}"!`
            : `Your proposal for "${row.job_title}" was not selected.`,
          time: row.updated_at,
          link: isAccepted ? `/chat` : `/job/${row.job_id}`,
          isUnread: isAccepted,
        });
      }

      // Check matching jobs in worker's category
      const workerProfile = await query('SELECT category FROM worker_profiles WHERE user_id = $1', [userId]);
      if (workerProfile.rows[0]?.category) {
        const cat = workerProfile.rows[0].category;
        const matchingJobs = await query(
          `SELECT j.id, j.title, j.budget, j.city, j.created_at, u.name AS client_name
           FROM jobs j
           JOIN users u ON u.id = j.client_id
           WHERE j.category = $1 AND j.status = 'open' AND j.client_id != $2
           ORDER BY j.created_at DESC
           LIMIT 5`,
          [cat, userId]
        );

        for (const row of matchingJobs.rows) {
          notifications.push({
            id: `match-job-${row.id}`,
            type: 'job',
            title: `New Job in Your Category: ${row.title}`,
            description: `Posted by ${row.client_name} in ${row.city || 'your area'} · Budget: Rs. ${Number(row.budget).toLocaleString()}`,
            time: row.created_at,
            link: `/job/${row.id}`,
            isUnread: false,
          });
        }
      }
    }

    // 3. Recent messages from other users
    const recentMessages = await query(
      `SELECT DISTINCT ON (m.room_id)
              m.id, m.text, m.sent_at, m.room_id, m.is_read,
              u.name AS sender_name, u.avatar_url AS sender_avatar
       FROM messages m
       JOIN chat_rooms cr ON cr.id = m.room_id
       JOIN users u ON u.id = m.sender_id
       WHERE (cr.client_id = $1 OR cr.worker_id = $1)
         AND m.sender_id != $1
       ORDER BY m.room_id, m.sent_at DESC
       LIMIT 8`,
      [userId]
    );

    for (const row of recentMessages.rows) {
      notifications.push({
        id: `msg-${row.id}`,
        type: 'message',
        title: `Message from ${row.sender_name}`,
        description: row.text.length > 60 ? row.text.slice(0, 60) + '...' : row.text,
        time: row.sent_at,
        link: `/chat`,
        isUnread: !row.is_read,
        avatar: row.sender_avatar,
      });
    }

    // 4. Default welcome notification
    notifications.push({
      id: `sys-welcome-${userId}`,
      type: 'system',
      title: 'Welcome to RozgarPK!',
      description: 'Your account is ready. Explore top jobs and hire verified local Pakistani professionals.',
      time: currentUser.created_at || new Date().toISOString(),
      link: currentUser.role === 'worker' ? '/worker/setup' : '/post-job',
      isUnread: false,
    });

    // Sort newest first
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    sendSuccess(res, notifications, 'Notifications retrieved');
  } catch (error) {
    console.error('getNotifications error:', error);
    sendError(res, 'Failed to fetch notifications', 500);
  }
};
