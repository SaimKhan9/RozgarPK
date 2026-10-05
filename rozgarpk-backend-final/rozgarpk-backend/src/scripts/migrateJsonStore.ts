import fs from 'fs';
import path from 'path';
import pool from '../config/db';
import { readStore } from '../data/storePersistence';

const run = async () => {
  const client = await pool.connect();
  try {
    const schemaPath = path.join(process.cwd(), 'src', 'config', 'schema.sql');
    await client.query(fs.readFileSync(schemaPath, 'utf8'));

    const store = readStore();
    await client.query('BEGIN');

    const migration = await client.query('SELECT version FROM app_migrations WHERE version = $1', ['json-store-v1']);
    if (migration.rows.length) {
      await client.query('ROLLBACK');
      console.log('JSON store migration was already applied; no data was changed.');
      return;
    }

    for (const user of store.users) {
      await client.query(
        `INSERT INTO users
          (id, name, email, phone, password_hash, role, city, area, avatar_url, is_active, is_verified, created_at, last_login_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET
          name=EXCLUDED.name, email=EXCLUDED.email, phone=EXCLUDED.phone, password_hash=EXCLUDED.password_hash,
          role=EXCLUDED.role, city=EXCLUDED.city, area=EXCLUDED.area, avatar_url=EXCLUDED.avatar_url,
          is_active=EXCLUDED.is_active, is_verified=EXCLUDED.is_verified`,
        [user.id, user.name, user.email, user.phone, user.passwordHash, user.role, user.city, user.area,
          user.avatarUrl || '', user.isActive, user.isVerified, user.createdAt, user.lastLoginAt || null]
      );
    }

    for (const profile of store.workerProfiles) {
      await client.query(
        `INSERT INTO worker_profiles
          (user_id, category, sub_category, skills, rate_per_day, rate_per_hour, rate_per_month,
           experience, bio, is_available, rating, total_reviews, total_jobs_done, license_type,
           has_own_vehicle, vehicle_model, is_verified, work_photos)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         ON CONFLICT (user_id) DO UPDATE SET
          category=EXCLUDED.category, sub_category=EXCLUDED.sub_category, skills=EXCLUDED.skills,
          rate_per_day=EXCLUDED.rate_per_day, rate_per_hour=EXCLUDED.rate_per_hour, rate_per_month=EXCLUDED.rate_per_month,
          experience=EXCLUDED.experience, bio=EXCLUDED.bio, is_available=EXCLUDED.is_available,
          rating=EXCLUDED.rating, total_reviews=EXCLUDED.total_reviews, total_jobs_done=EXCLUDED.total_jobs_done,
          license_type=EXCLUDED.license_type, has_own_vehicle=EXCLUDED.has_own_vehicle,
          vehicle_model=EXCLUDED.vehicle_model, is_verified=EXCLUDED.is_verified, work_photos=EXCLUDED.work_photos`,
        [profile.userId, profile.category, profile.subCategory, profile.skills, profile.ratePerDay,
          profile.ratePerHour ?? null, profile.ratePerMonth ?? null, profile.experience, profile.bio,
          profile.isAvailable, profile.rating, profile.totalReviews, profile.totalJobsDone,
          profile.licenseType ?? null, profile.hasOwnVehicle ?? false, profile.vehicleModel ?? null,
          profile.isVerified, profile.workPhotos]
      );
    }

    for (const job of store.jobs) {
      await client.query(
        `INSERT INTO jobs
          (id, client_id, title, description, category, sub_category, budget, budget_max, payment_type,
           duration, city, area, is_urgent, status, image_url, proposals, views, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT (id) DO UPDATE SET
          title=EXCLUDED.title, description=EXCLUDED.description, category=EXCLUDED.category,
          sub_category=EXCLUDED.sub_category, budget=EXCLUDED.budget, budget_max=EXCLUDED.budget_max,
          payment_type=EXCLUDED.payment_type, duration=EXCLUDED.duration, city=EXCLUDED.city,
          area=EXCLUDED.area, is_urgent=EXCLUDED.is_urgent, status=EXCLUDED.status,
          image_url=EXCLUDED.image_url, proposals=EXCLUDED.proposals, views=EXCLUDED.views,
          updated_at=EXCLUDED.updated_at`,
        [job.id, job.clientId, job.title, job.description, job.category, job.subCategory, job.budget,
          job.budgetMax ?? null, job.paymentType, job.duration, job.city, job.area, job.isUrgent,
          job.status, job.imageUrl || '', job.proposalsCount, job.viewsCount, job.createdAt, job.updatedAt]
      );
    }

    for (const room of store.chatRooms) {
      await client.query(
        `INSERT INTO chat_rooms (id, job_id, client_id, worker_id, created_at)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
        [room.id, room.jobId ?? null, room.clientId, room.workerId, room.createdAt]
      );
    }

    for (const message of store.messages) {
      await client.query(
        `INSERT INTO messages (id, room_id, sender_id, text, sent_at, is_read)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [message.id, message.roomId, message.senderId, message.text, message.sentAt, message.isRead]
      );
    }

    await client.query('INSERT INTO app_migrations (version) VALUES ($1)', ['json-store-v1']);
    await client.query('COMMIT');
    console.log(`Imported ${store.users.length} users, ${store.workerProfiles.length} worker profiles, ${store.jobs.length} jobs, ${store.chatRooms.length} chat rooms, and ${store.messages.length} messages.`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch((error: unknown) => {
  console.error('JSON-to-PostgreSQL migration failed:', error);
  process.exitCode = 1;
});