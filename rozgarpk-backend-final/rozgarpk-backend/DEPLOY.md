# Deployment Guide Notice

The steps below target the former Railway/Render setup and are not valid for the current PostgreSQL-backed Aiven deployment. Use [AIVEN_DEPLOY.md](AIVEN_DEPLOY.md) instead.

---

# 🚀 RozgarPK — Legacy Deployment Guide

## Architecture After Deploy

```
Vercel (Frontend)          Railway/Render (Backend)      Supabase/Render (DB)
rozgarpk.vercel.app   →   rozgarpk-api.railway.app  →   PostgreSQL Database
       ↕                           ↕
  Cloudinary             Socket.io (real-time chat)
 (photo uploads)
```

---

## Step 1 — Cloudinary Setup (Photo Uploads) — FREE

1. Go to **cloudinary.com** → Sign up free
2. Go to **Settings → Upload → Upload Presets**
3. Click **Add upload preset**
   - Preset name: `rozgarpk`
   - Signing mode: `Unsigned`
   - Folder: `rozgarpk`
4. Save preset
5. Copy your **Cloud Name** from Dashboard

---

## Step 2 — Deploy Backend to Railway — FREE

### Option A: Railway (Recommended — easiest)

1. Go to **railway.app** → Sign up with GitHub
2. Click **New Project → Deploy from GitHub Repo**
3. Select your `rozgarpk-backend` repo
4. Railway auto-detects Node.js
5. Click **Add Plugin → PostgreSQL** (Railway gives you a free DB)
6. Go to **Variables** tab → Add these:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=any_long_random_string_here_make_it_long
CLIENT_URL=https://your-frontend.vercel.app

# Railway fills these automatically from PostgreSQL plugin:
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
```

7. Click **Deploy**
8. Once deployed, go to **Settings → Domain** → copy your URL
9. Run the schema — go to Railway PostgreSQL plugin → **Query** tab → paste and run `src/config/schema.sql`

### Option B: Render

1. Go to **render.com** → Sign up
2. New → Web Service → Connect GitHub repo
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add PostgreSQL database (New → PostgreSQL)
6. Set environment variables (same as Railway above)
7. Deploy

---

## Step 3 — Deploy Frontend to Vercel — FREE

1. Go to **vercel.com** → Sign up with GitHub
2. Click **New Project → Import** your `rozgarpk` frontend repo
3. Framework: **Vite**
4. Go to **Environment Variables** → Add:

```
VITE_API_URL=https://your-railway-url.railway.app/api
VITE_SOCKET_URL=https://your-railway-url.railway.app
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_PRESET=rozgarpk
```

5. Click **Deploy**
6. Your site is live at `https://rozgarpk.vercel.app`

---

## Step 4 — Update CORS on Backend

After frontend deploys, go to Railway → Variables → update:

```
CLIENT_URL=https://rozgarpk.vercel.app
```

Then redeploy the backend.

---

## Step 5 — Test Everything

```
✅ Open https://rozgarpk.vercel.app
✅ Register as a client and as a worker
✅ Post a job as client
✅ Apply to job as worker
✅ Accept proposal → chat opens
✅ Send messages in real-time
✅ Upload a photo on job post
✅ Leave a review after job completion
```

---

## 💰 Cost Summary (All Free Tiers)

| Service    | What It Does           | Free Tier Limit                    |
| ---------- | ---------------------- | ---------------------------------- |
| Vercel     | Frontend hosting       | Unlimited static sites             |
| Railway    | Backend + PostgreSQL   | $5 credit/month (enough for start) |
| Render     | Alternative to Railway | 750 hrs/month free                 |
| Cloudinary | Photo storage          | 25GB storage, 25GB bandwidth/month |
| Supabase   | Alternative PostgreSQL | 500MB DB, unlimited API calls      |

**Total monthly cost to start: Rs. 0** 🎉

---

## 🔧 Local Development (Full Stack)

```bash
# Terminal 1 — PostgreSQL must be running locally
psql -U postgres -c "CREATE DATABASE rozgarpk;"
psql -U postgres -d rozgarpk -f src/config/schema.sql

# Terminal 2 — Backend
cd rozgarpk-backend
cp .env.example .env    # fill in your local DB details
npm install
npm run dev             # http://localhost:5000

# Terminal 3 — Frontend
cd rozgarpk
npm install
npm run dev             # http://localhost:5173
```

---

## Common Issues

**CORS error?**
→ Make sure `CLIENT_URL` in backend .env matches your frontend URL exactly

**Socket.io not connecting?**
→ Make sure `VITE_SOCKET_URL` points to your backend, not `/api`

**DB connection failed?**
→ Check DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD are all set correctly

**Photos not uploading?**
→ Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_PRESET match your Cloudinary dashboard

**Railway free tier?**
→ Railway gives $5/month free credit — enough for ~500 hours of a small Node app + PostgreSQL
