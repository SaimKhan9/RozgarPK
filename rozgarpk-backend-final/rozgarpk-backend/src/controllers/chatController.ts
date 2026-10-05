import { Response } from 'express';
import { query } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest } from '../types';

export const createChatRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetUserId, jobId } = req.body as { targetUserId?: string; jobId?: string };
    const userId = req.user?.userId;
    const users = await query('SELECT id, role FROM users WHERE id = ANY($1::text[]) AND is_active = TRUE', [[userId, targetUserId]]);
    const currentUser = users.rows.find((user) => user.id === userId);
    const targetUser = users.rows.find((user) => user.id === targetUserId);

    if (!currentUser || !targetUser || currentUser.id === targetUser.id || currentUser.role === targetUser.role) {
      sendError(res, 'Choose a valid client or worker to message', 400);
      return;
    }

    const clientId = currentUser.role === 'client' ? currentUser.id : targetUser.id;
    const workerId = currentUser.role === 'worker' ? currentUser.id : targetUser.id;
    let jobTitle = 'Direct conversation';

    if (jobId) {
      const jobResult = await query('SELECT title FROM jobs WHERE id = $1 AND client_id = $2', [jobId, clientId]);
      if (!jobResult.rows[0]) {
        sendError(res, 'The selected job is not available for this conversation', 404);
        return;
      }
      jobTitle = jobResult.rows[0].title;
    }

    let room = await query(
      `SELECT id FROM chat_rooms WHERE client_id = $1 AND worker_id = $2 AND job_id IS NOT DISTINCT FROM $3 LIMIT 1`,
      [clientId, workerId, jobId || null]
    );
    let roomId = room.rows[0]?.id as string | undefined;
    if (!roomId) {
      const created = await query(
        'INSERT INTO chat_rooms (client_id, worker_id, job_id) VALUES ($1, $2, $3) RETURNING id',
        [clientId, workerId, jobId || null]
      );
      roomId = created.rows[0].id;
    }

    const other = await query('SELECT id, name, role, phone, avatar_url FROM users WHERE id = $1', [targetUserId]);
    sendSuccess(res, {
      id: roomId,
      jobId: jobId || undefined,
      jobTitle,
      clientId,
      workerId,
      otherUserId: other.rows[0].id,
      otherUserRole: other.rows[0].role,
      otherUserPhone: other.rows[0].phone,
      workerName: other.rows[0].name,
      workerAvatar: other.rows[0].avatar_url || '',
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      unread: 0,
      messages: [],
    }, 'Conversation ready', 201);
  } catch (error) {
    console.error('CreateChatRoom error:', error);
    sendError(res, 'Could not start conversation', 500);
  }
};

// GET /api/chat/rooms — Get all chat rooms for current user
export const getChatRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const result = await query(
      `SELECT cr.id, cr.job_id AS "jobId", COALESCE(j.title, 'Direct conversation') AS "jobTitle",
              cr.client_id AS "clientId", cr.worker_id AS "workerId",
              CASE WHEN cr.client_id = $1 THEN uw.id ELSE uc.id END AS "otherUserId",
              CASE WHEN cr.client_id = $1 THEN uw.role ELSE uc.role END AS "otherUserRole",
              CASE WHEN cr.client_id = $1 THEN uw.phone ELSE uc.phone END AS "otherUserPhone",
              CASE WHEN cr.client_id = $1 THEN uw.name ELSE uc.name END AS "workerName",
              CASE WHEN cr.client_id = $1 THEN uw.avatar_url ELSE uc.avatar_url END AS "workerAvatar",
              COALESCE((SELECT text FROM messages WHERE room_id = cr.id ORDER BY sent_at DESC LIMIT 1), '') AS "lastMessage",
              COALESCE((SELECT sent_at FROM messages WHERE room_id = cr.id ORDER BY sent_at DESC LIMIT 1), cr.created_at) AS "lastMessageAt",
              (SELECT COUNT(*) FROM messages WHERE room_id = cr.id AND sender_id <> $1 AND is_read = FALSE)::int AS unread
       FROM chat_rooms cr
       INNER JOIN users uc ON uc.id = cr.client_id
       INNER JOIN users uw ON uw.id = cr.worker_id
       LEFT JOIN jobs j ON j.id = cr.job_id
       WHERE cr.client_id = $1 OR cr.worker_id = $1
       ORDER BY "lastMessageAt" DESC`,
      [userId]
    );
    const rooms = result.rows.map((room) => ({ ...room, messages: [] }));
    sendSuccess(res, rooms);
  } catch (err) {
    console.error('GetChatRooms error:', err);
    sendError(res, 'Could not fetch chat rooms', 500);
  }
};

// GET /api/chat/messages/:roomId — Get messages in a room
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.userId;
    const room = await query(
      'SELECT id FROM chat_rooms WHERE id = $1 AND (client_id = $2 OR worker_id = $2)',
      [roomId, userId]
    );
    if (!room.rows[0]) {
      sendError(res, 'Chat room not found or access denied', 404);
      return;
    }

    const result = await query(
      `UPDATE messages SET is_read = TRUE WHERE room_id = $1 AND sender_id <> $2`,
      [roomId, userId]
    );
    void result;
    const messages = await query(
      `SELECT m.id, m.room_id AS "roomId", m.sender_id AS "senderId", m.text,
              m.sent_at AS "sentAt", m.is_read AS "isRead",
              u.name AS "senderName", u.avatar_url AS "senderAvatar"
       FROM messages m INNER JOIN users u ON u.id = m.sender_id
       WHERE m.room_id = $1 ORDER BY m.sent_at ASC`,
      [roomId]
    );
    sendSuccess(res, messages.rows);
  } catch (err) {
    console.error('GetMessages error:', err);
    sendError(res, 'Could not fetch messages', 500);
  }
};

// POST /api/chat/messages — Persist and broadcast a message
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId, text } = req.body as { roomId?: string; text?: string };
    const senderId = req.user!.userId;

    if (!roomId || !text?.trim()) {
      sendError(res, 'Room ID and text are required', 400);
      return;
    }

    const room = await query(
      'SELECT id, client_id, worker_id FROM chat_rooms WHERE id = $1 AND (client_id = $2 OR worker_id = $2)',
      [roomId, senderId]
    );
    if (!room.rows[0]) {
      sendError(res, 'Chat room not found or access denied', 404);
      return;
    }

    const result = await query(
      `INSERT INTO messages (room_id, sender_id, text) VALUES ($1, $2, $3)
       RETURNING id, room_id AS "roomId", sender_id AS "senderId", text, sent_at AS "sentAt", is_read AS "isRead"`,
      [roomId, senderId, text.trim()]
    );
    const sender = await query('SELECT name, avatar_url FROM users WHERE id = $1', [senderId]);
    const responseMessage = {
      ...result.rows[0],
      senderName: sender.rows[0]?.name || 'User',
      senderAvatar: sender.rows[0]?.avatar_url || '',
    };
    const recipientId = room.rows[0].client_id === senderId ? room.rows[0].worker_id : room.rows[0].client_id;
    req.app.get('io')?.to(roomId).emit('receive_message', responseMessage);
    req.app.get('io')?.to(`user:${recipientId}`).emit('new_message', responseMessage);
    sendSuccess(res, responseMessage, 'Message sent', 201);
  } catch (err) {
    console.error('SendMessage error:', err);
    sendError(res, 'Could not send message', 500);
  }
};
