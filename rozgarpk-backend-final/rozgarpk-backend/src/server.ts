import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes     from './routes/authRoutes';
import workerRoutes   from './routes/workerRoutes';
import jobRoutes      from './routes/jobRoutes';
import proposalRoutes from './routes/proposalRoutes';
import chatRoutes     from './routes/chatRoutes';
import reviewRoutes   from './routes/reviewRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { verifyToken } from './utils/jwt';
import { query } from './config/db';

dotenv.config();

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 5000;

// ─── Socket.io setup ───────────────────────────
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});
app.set('io', io);

// Socket.io real-time chat
io.use((socket, next) => {
  const token = socket.handshake.auth.token as string;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = verifyToken(token);
    (socket as unknown as Record<string, unknown>).user = decoded;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const user = (socket as unknown as Record<string, unknown>).user as { userId: string; role: string };
  socket.join(`user:${user.userId}`);
  console.log(`🔌 Socket connected: ${user.userId} (${user.role})`);

  // Join a chat room
  socket.on('join_room', async (roomId: string) => {
    try {
      const room = await query(
        'SELECT id FROM chat_rooms WHERE id = $1 AND (client_id = $2 OR worker_id = $2)',
        [roomId, user.userId]
      );
      if (room.rows[0]) {
      socket.join(roomId);
      console.log(`👤 ${user.userId} joined room ${roomId}`);
      }
    } catch (error) {
      console.error('Socket room join error:', error);
    }
  });

  // Send a message via socket
  socket.on('send_message', async (data: { roomId: string; text: string }) => {
    try {
      const room = await query(
        'SELECT id, client_id, worker_id FROM chat_rooms WHERE id = $1 AND (client_id = $2 OR worker_id = $2)',
        [data.roomId, user.userId]
      );
      const text = typeof data.text === 'string' ? data.text.trim() : '';
      if (!room.rows[0] || !text) {
        socket.emit('message_error', { message: 'Chat room not found or message is empty' });
        return;
      }
      const inserted = await query(
        `INSERT INTO messages (room_id, sender_id, text) VALUES ($1, $2, $3)
         RETURNING id, room_id AS "roomId", sender_id AS "senderId", text, sent_at AS "sentAt", is_read AS "isRead"`,
        [data.roomId, user.userId, text]
      );
      const sender = await query('SELECT name, avatar_url FROM users WHERE id = $1', [user.userId]);
      const responseMessage = {
        ...inserted.rows[0],
        senderName: sender.rows[0]?.name || 'User',
        senderAvatar: sender.rows[0]?.avatar_url || '',
      };
      const recipientId = room.rows[0].client_id === user.userId ? room.rows[0].worker_id : room.rows[0].client_id;
      io.to(data.roomId).emit('receive_message', responseMessage);
      io.to(`user:${recipientId}`).emit('new_message', responseMessage);
    } catch (err) {
      console.error('Socket message error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', async (data: { roomId: string; isTyping: boolean }) => {
    try {
      const room = await query(
        'SELECT id FROM chat_rooms WHERE id = $1 AND (client_id = $2 OR worker_id = $2)',
        [data.roomId, user.userId]
      );
      if (!room.rows[0]) return;
      socket.to(data.roomId).emit('user_typing', {
        userId: user.userId,
        isTyping: data.isTyping,
      });
    } catch (error) {
      console.error('Socket typing error:', error);
    }
  });

  // Unsend a message via socket
  socket.on('unsend_message', async (data: { messageId: string }) => {
    try {
      const msg = await query(
        'SELECT id, room_id FROM messages WHERE id = $1 AND sender_id = $2',
        [data.messageId, user.userId]
      );
      if (!msg.rows[0]) {
        socket.emit('error', { message: 'Message not found or you cannot unsend this message' });
        return;
      }
      const roomId = msg.rows[0].room_id;
      await query('DELETE FROM messages WHERE id = $1', [data.messageId]);
      io.to(roomId).emit('message_deleted', { messageId: data.messageId, roomId });
    } catch (err) {
      console.error('Socket unsend error:', err);
      socket.emit('error', { message: 'Failed to unsend message' });
    }
  });

  // Delete an entire chat room via socket
  socket.on('delete_room', async (data: { roomId: string }) => {
    try {
      const room = await query(
        'SELECT id, client_id, worker_id FROM chat_rooms WHERE id = $1 AND (client_id = $2 OR worker_id = $2)',
        [data.roomId, user.userId]
      );
      if (!room.rows[0]) {
        socket.emit('error', { message: 'Room not found or unauthorized' });
        return;
      }
      const { client_id, worker_id } = room.rows[0];
      await query('DELETE FROM chat_rooms WHERE id = $1', [data.roomId]);
      io.to(data.roomId).emit('chat_deleted', { roomId: data.roomId });
      io.to(`user:${client_id}`).emit('chat_deleted', { roomId: data.roomId });
      io.to(`user:${worker_id}`).emit('chat_deleted', { roomId: data.roomId });
    } catch (err) {
      console.error('Socket delete room error:', err);
      socket.emit('error', { message: 'Failed to delete room' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${user.userId}`);
  });
});

// ─── Express Middleware ─────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ───────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({
      status: 'OK',
      database: 'connected',
      message: 'RozgarPK API and database are ready',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  } catch {
    res.status(503).json({
      status: 'ERROR',
      database: 'unavailable',
      message: 'Database connection is not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

// ─── API Routes ─────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/workers',   workerRoutes);
app.use('/api/jobs',      jobRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/chat',      chatRoutes);
app.use('/api/reviews',   reviewRoutes);

// ─── API Docs (quick reference) ─────────────────
app.get('/api', (_req, res) => {
  res.json({
    name: 'RozgarPK API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login':    'Login and get JWT token',
        'GET  /api/auth/me':       'Get current user (protected)',
      },
      workers: {
        'GET  /api/workers':              'Browse workers (filters: category, city, minRating, maxRate, search)',
        'GET  /api/workers/:id':          'Get worker profile + reviews',
        'POST /api/workers/profile':      'Create/update worker profile (worker only)',
        'PATCH /api/workers/availability':'Toggle availability (worker only)',
      },
      jobs: {
        'GET  /api/jobs':       'Browse jobs (filters: category, city, isUrgent, search)',
        'GET  /api/jobs/my':    'Get my jobs (client only)',
        'GET  /api/jobs/:id':   'Get single job',
        'POST /api/jobs':       'Post a job (client only)',
        'PATCH /api/jobs/:id':  'Update job (owner only)',
        'DELETE /api/jobs/:id': 'Delete job (owner only)',
      },
      proposals: {
        'POST /api/proposals':           'Apply to a job (worker only)',
        'GET  /api/proposals/my':        'Get my proposals (worker only)',
        'GET  /api/proposals/job/:id':   'Get proposals for a job (client only)',
        'PATCH /api/proposals/:id':      'Accept or reject proposal (client only)',
      },
      chat: {
        'GET  /api/chat/rooms':              'Get all chat rooms',
        'POST /api/chat/rooms':              'Start or retrieve a conversation',
        'GET  /api/chat/messages/:roomId':   'Get messages in a room',
        'POST /api/chat/messages':           'Send and broadcast a message',
      },
      reviews: {
        'GET  /api/reviews/worker/:id': 'Get worker reviews',
        'POST /api/reviews':            'Leave a review (client only)',
      },
    },
  });
});

// ─── 404 & Error handlers ────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ────────────────────────────────
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║     🚀 RozgarPK API Server           ║
  ║     Running on port ${PORT}             ║
  ║     http://localhost:${PORT}/api        ║
  ╚══════════════════════════════════════╝
  `);
});

export default app;
