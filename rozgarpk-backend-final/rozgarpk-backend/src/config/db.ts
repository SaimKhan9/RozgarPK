import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const caCertificate = process.env.DATABASE_CA_CERT || (
  process.env.DATABASE_CA_CERT_PATH
    ? fs.readFileSync(path.resolve(process.env.DATABASE_CA_CERT_PATH), 'utf8')
    : undefined
);

let poolConnectionString = connectionString;
if (connectionString && caCertificate) {
  const parsedUrl = new URL(connectionString);
  parsedUrl.searchParams.delete('sslmode');
  parsedUrl.searchParams.delete('sslrootcert');
  poolConnectionString = parsedUrl.toString();
}

const pool = new Pool(connectionString ? {
  connectionString: poolConnectionString,
  ...(caCertificate ? { ssl: { ca: caCertificate, rejectUnauthorized: true } } : {}),
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
} : {
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'rozgarpk',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
  process.exit(1);
});

export default pool;

// Helper to run queries
export const query = (text: string, params?: unknown[]) => pool.query(text, params);
