import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Parse DATABASE_URL or use individual parameters
let poolConfig;

console.log('🔍 DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
    console.log('🔍 Attempting to parse DATABASE_URL...');
    // Try to parse the connection string
    try {
        const url = new URL(process.env.DATABASE_URL);
        const password = url.password ? decodeURIComponent(url.password) : '';
        
        console.log('✅ Successfully parsed DATABASE_URL');
        console.log('📝 Password length:', password.length);
        
        poolConfig = {
            host: url.hostname,
            port: parseInt(url.port) || 5432,
            database: url.pathname.slice(1), // Remove leading /
            user: url.username,
            password: password,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        };
    } catch (error) {
        console.error('❌ Error parsing DATABASE_URL:', error.message);
        // Fallback to connection string
        poolConfig = {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        };
    }
} else {
    console.log('⚠️  DATABASE_URL not set, using individual variables');
    // Use individual environment variables
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'capstone',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
}

const pool = new Pool(poolConfig);

// Debug logging
console.log('🔌 Database connection config:', {
    host: poolConfig.host || 'from connection string',
    port: poolConfig.port || 'from connection string',
    database: poolConfig.database || 'from connection string',
    user: poolConfig.user || 'from connection string',
    password: poolConfig.password ? `${poolConfig.password.substring(0, 3)}***` : 'NOT SET',
    passwordLength: poolConfig.password ? poolConfig.password.length : 0
});

// Test database connection
pool.connect()
    .then(client => {
        console.log('✅ PostgreSQL connected successfully');
        client.release();
    })
    .catch(err => {
        console.error('❌ PostgreSQL connection error:', err.message);
    });

const db = drizzle(pool, { schema });

export { db, pool, schema };
