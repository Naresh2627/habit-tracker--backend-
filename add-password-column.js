// Add password column to account table
import dotenv from 'dotenv';
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

dotenv.config();

console.log('\n🔧 Adding password column to account table\n');

async function addColumn() {
    try {
        await db.execute(sql`
            ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "password" text;
        `);
        
        console.log('✅ Password column added successfully\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addColumn();
