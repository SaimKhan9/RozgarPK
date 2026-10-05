# RozgarPK Backend API

Node.js + Express + TypeScript + PostgreSQL + Socket.io

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Create PostgreSQL database
```bash
psql -U postgres
CREATE DATABASE rozgarpk;
\q
```

### 4. Run database schema
```bash
psql -U postgres -d rozgarpk -f src/config/schema.sql
```

### 5. Start development server
```bash
npm run dev
```

Server runs at: `http://localhost:5000`
API docs at:    `http://localhost:5000/api`
Health check:   `http://localhost:5000/health`

---

## 📁 Project Structure

```
src/
├── config/
│   ├── db.ts           ← PostgreSQL connection pool
│   └── schema.sql      ← All table definitions + indexes
├── controllers/
│   ├── authController.ts      ← Register, Login, GetMe
│   ├── workerController.ts    ← Browse workers, profile CRUD
│   ├── jobController.ts       ← Post/browse/update jobs
│   ├── proposalController.ts  ← Apply, accept, reject proposals
│   ├── chatController.ts      ← Chat rooms + messages
│   └── reviewController.ts    ← Leave + fetch reviews
├── middleware/
│   ├── auth.ts          ← JWT protect + role restrict
│   └── errorHandler.ts  ← Global error + 404 handler
├── routes/
│   ├── authRoutes.ts
│   ├── workerRoutes.ts
│   ├── jobRoutes.ts
│   ├── proposalRoutes.ts
│   ├── chatRoutes.ts
│   └── reviewRoutes.ts
├── types/index.ts       ← All TypeScript interfaces
├── utils/
│   ├── jwt.ts           ← Token generate + verify
│   └── response.ts      ← Standard API response helpers
└── server.ts            ← Express app + Socket.io entry
```

---

## 🔑 Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Get a token by calling `POST /api/auth/login`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint              | Access  | Description              |
|--------|-----------------------|---------|--------------------------|
| POST   | /api/auth/register    | Public  | Register new user        |
| POST   | /api/auth/login       | Public  | Login, get JWT token     |
| GET    | /api/auth/me          | Private | Get current user profile |

### Workers
| Method | Endpoint                    | Access       | Description              |
|--------|-----------------------------|--------------|--------------------------|
| GET    | /api/workers                | Public       | Browse workers (filters) |
| GET    | /api/workers/:id            | Public       | Worker profile + reviews |
| POST   | /api/workers/profile        | Worker only  | Create/update profile    |
| PATCH  | /api/workers/availability   | Worker only  | Toggle available/busy    |

### Jobs
| Method | Endpoint        | Access       | Description           |
|--------|-----------------|--------------|-----------------------|
| GET    | /api/jobs       | Public       | Browse jobs (filters) |
| GET    | /api/jobs/my    | Client only  | My posted jobs        |
| GET    | /api/jobs/:id   | Public       | Single job details    |
| POST   | /api/jobs       | Client only  | Post a new job        |
| PATCH  | /api/jobs/:id   | Client only  | Update job            |
| DELETE | /api/jobs/:id   | Client only  | Delete job            |

### Proposals
| Method | Endpoint                    | Access       | Description               |
|--------|-----------------------------|--------------|---------------------------|
| POST   | /api/proposals              | Worker only  | Apply to a job            |
| GET    | /api/proposals/my           | Worker only  | My submitted proposals    |
| GET    | /api/proposals/job/:jobId   | Client only  | Proposals for my job      |
| PATCH  | /api/proposals/:id          | Client only  | Accept or reject proposal |

### Chat
| Method | Endpoint                      | Access  | Description            |
|--------|-------------------------------|---------|------------------------|
| GET    | /api/chat/rooms               | Private | Get all my chat rooms  |
| GET    | /api/chat/messages/:roomId    | Private | Get messages in a room |
| POST   | /api/chat/messages            | Private | Send a message (REST)  |

### Reviews
| Method | Endpoint                      | Access       | Description           |
|--------|-------------------------------|--------------|-----------------------|
| GET    | /api/reviews/worker/:workerId | Public       | Get worker reviews    |
| POST   | /api/reviews                  | Client only  | Leave a review        |

---

## ⚡ Real-time Chat (Socket.io)

Connect to Socket.io with your JWT token:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});

// Join a room
socket.emit('join_room', roomId);

// Send a message
socket.emit('send_message', { roomId, text: 'Hello!' });

// Receive messages
socket.on('receive_message', (message) => {
  console.log(message);
});

// Typing indicator
socket.emit('typing', { roomId, isTyping: true });
socket.on('user_typing', ({ userId, isTyping }) => {
  // Show typing indicator
});
```

---

## 🗄️ Database Schema

| Table             | Purpose                              |
|-------------------|--------------------------------------|
| users             | All users (clients + workers)        |
| worker_profiles   | Worker skills, rates, availability   |
| jobs              | Job postings by clients              |
| proposals         | Worker applications to jobs          |
| chat_rooms        | Conversation threads per job         |
| messages          | Individual chat messages             |
| reviews           | Client reviews for workers           |

---

## 🌐 Deploy to Production

### Option 1: Railway (recommended — free tier)
1. Push code to GitHub
2. Connect repo to railway.app
3. Add PostgreSQL plugin
4. Set environment variables
5. Deploy!

### Option 2: Render
1. Create Web Service on render.com
2. Add PostgreSQL database
3. Set env vars and deploy

### Option 3: VPS (DigitalOcean/Linode)
```bash
npm run build
npm start       # runs compiled JS from /dist
```
