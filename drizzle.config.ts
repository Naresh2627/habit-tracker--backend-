import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
    // If not found, try loading from parent dir
    dotenv.config({ path: '../.env' });
}

export default defineConfig({
    schema: './db/schema.js',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || '',
    },
    verbose: true,
    strict: true
    });
