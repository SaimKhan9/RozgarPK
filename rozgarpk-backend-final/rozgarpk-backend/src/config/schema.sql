-- ============================================
-- RozgarPK Database Schema
-- Run this file once to create all tables
-- psql -U postgres -d rozgarpk -f schema.sql
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─── USERS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  phone       VARCHAR(20)  UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role        VARCHAR(20)  NOT NULL CHECK (role IN ('client','worker','admin')),
  city        VARCHAR(100),
  area        VARCHAR(100),
  avatar_url  VARCHAR(500),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── WORKER PROFILES ─────────────────────────
CREATE TABLE IF NOT EXISTS worker_profiles (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category        VARCHAR(50) NOT NULL,
  sub_category    VARCHAR(100),
  skills          TEXT[] DEFAULT '{}',
  rate_per_day    NUMERIC(10,2),
  rate_per_hour   NUMERIC(10,2),
  rate_per_month  NUMERIC(10,2),
  experience      INTEGER DEFAULT 0,
  bio             TEXT,
  is_available    BOOLEAN DEFAULT TRUE,
  rating          NUMERIC(3,2) DEFAULT 0,
  total_reviews   INTEGER DEFAULT 0,
  total_jobs_done INTEGER DEFAULT 0,
  license_type    VARCHAR(50),
  has_own_vehicle BOOLEAN DEFAULT FALSE,
  vehicle_model   VARCHAR(100),
  is_verified     BOOLEAN DEFAULT FALSE,
  work_photos     TEXT[] DEFAULT '{}',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─── JOBS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  description  TEXT NOT NULL,
  category     VARCHAR(50) NOT NULL,
  sub_category VARCHAR(100),
  budget       NUMERIC(12,2) NOT NULL,
  budget_max   NUMERIC(12,2),
  payment_type VARCHAR(30) DEFAULT 'fixed',
  duration     VARCHAR(30) DEFAULT '1day',
  city         VARCHAR(100),
  area         VARCHAR(100),
  is_urgent    BOOLEAN DEFAULT FALSE,
  status       VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','in-progress','completed','closed')),
  image_url    VARCHAR(500),
  proposals    INTEGER DEFAULT 0,
  views        INTEGER DEFAULT 0,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── PROPOSALS ───────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  job_id        TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quoted_price  NUMERIC(12,2) NOT NULL,
  message       TEXT NOT NULL,
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, worker_id)
);

-- ─── CHAT ROOMS ──────────────────────────────
CREATE TABLE IF NOT EXISTS chat_rooms (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  job_id     TEXT REFERENCES jobs(id) ON DELETE SET NULL,
  client_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, client_id, worker_id)
);

-- ─── MESSAGES ────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  room_id    TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  media_url  VARCHAR(500),
  is_read    BOOLEAN DEFAULT FALSE,
  sent_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── REVIEWS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  job_id     TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  client_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, client_id)
);

-- ─── INDEXES (for fast queries) ──────────────
CREATE INDEX IF NOT EXISTS idx_jobs_category    ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_city        ON jobs(city);
CREATE INDEX IF NOT EXISTS idx_jobs_status      ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id   ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at  ON jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_proposals_job_id    ON proposals(job_id);
CREATE INDEX IF NOT EXISTS idx_proposals_worker_id ON proposals(worker_id);

CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_worker_profiles_category ON worker_profiles(category);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_user_id  ON worker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_worker_id        ON reviews(worker_id);

-- ─── FUNCTION: Auto-update updated_at ────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_worker_profiles_updated_at ON worker_profiles;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;

CREATE TRIGGER update_users_updated_at          BEFORE UPDATE ON users           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at            BEFORE UPDATE ON jobs            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at       BEFORE UPDATE ON proposals       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Schema created successfully! ✅' AS message;
