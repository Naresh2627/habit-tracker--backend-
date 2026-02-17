import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Parse DATABASE_URL or use individual parameters
let poolConfig;

const hasDatabaseUrl = !!process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const isRender = !!process.env.RENDER || (process.env.DATABASE_URL || '').includes('render.com');
const shouldUseSsl = isProduction || isRender || process.env.PGSSLMODE === 'require';

console.log('DATABASE_URL exists:', hasDatabaseUrl);

if (hasDatabaseUrl) {
  console.log('Attempting to parse DATABASE_URL...');
  // Prefer connection string for managed databases
  try {
    const url = new URL(process.env.DATABASE_URL);
    const password = url.password ? decodeURIComponent(url.password) : '';

    console.log('Successfully parsed DATABASE_URL');
    console.log('Password length:', password.length);

    poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
    };

    if (isProduction && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
      console.warn('DATABASE_URL points to localhost in production. Update it to your managed database URL.');
    }
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error.message);
    // Fallback to connection string
    poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
    };
  }
} else {
  console.log('DATABASE_URL not set, using individual variables');
  // Use individual environment variables
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'capstone',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
  };
}

const pool = new Pool(poolConfig);

// Debug logging
console.log('Database connection config:', {
  host: poolConfig.host || 'from connection string',
  port: poolConfig.port || 'from connection string',
  database: poolConfig.database || 'from connection string',
  user: poolConfig.user || 'from connection string',
  password: poolConfig.password ? `${poolConfig.password.substring(0, 3)}***` : 'from connection string',
  passwordLength: poolConfig.password ? poolConfig.password.length : 'from connection string',
  ssl: poolConfig.ssl ? 'enabled' : 'disabled'
});

// Test database connection
pool.connect()
  .then(client => {
    console.log('PostgreSQL connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('PostgreSQL connection error:', err.message);
  });

const db = drizzle(pool, { schema });

export { db, pool, schema };
