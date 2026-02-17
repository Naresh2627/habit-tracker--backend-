// Check if database tables exist
import dotenv from 'dotenv';
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

const result = dotenv.config();
if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
} else {
    console.log('✅ .env file loaded');
}

console.log('\n🔍 Database Tables Check\n');
console.log('='.repeat(50));

async function checkTables() {
    try {
        // Check if tables exist
        const tables = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('\n📋 Existing Tables:');
        if (tables.rows.length === 0) {
            console.log('  ❌ No tables found!');
            console.log('\n  You need to create the database tables.');
            console.log('  Run the SQL files in the database folder.');
        } else {
            tables.rows.forEach(row => {
                console.log(`  ✓ ${row.table_name}`);
            });
        }

        // Check required Better Auth tables
        const requiredTables = ['user', 'session', 'account', 'verification'];
        const existingTableNames = tables.rows.map(r => r.table_name);
        
        console.log('\n🔐 Better Auth Tables:');
        requiredTables.forEach(table => {
            const exists = existingTableNames.includes(table);
            console.log(`  ${exists ? '✓' : '✗'} ${table}`);
        });

        // Check application tables
        const appTables = ['profiles', 'habits', 'progress', 'shared_progress'];
        console.log('\n📱 Application Tables:');
        appTables.forEach(table => {
            const exists = existingTableNames.includes(table);
            console.log(`  ${exists ? '✓' : '✗'} ${table}`);
        });

        // Check if we can query the user table
        if (existingTableNames.includes('user')) {
            try {
                const userCount = await db.execute(sql`SELECT COUNT(*) FROM "user"`);
                console.log(`\n👥 Users in database: ${userCount.rows[0].count}`);
            } catch (error) {
                console.log('\n❌ Error querying user table:', error.message);
            }
        }

        console.log('\n' + '='.repeat(50) + '\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database error:', error.message);
        console.log('\nMake sure:');
        console.log('  1. PostgreSQL is running');
        console.log('  2. DATABASE_URL in .env is correct');
        console.log('  3. Database exists');
        console.log('\n' + '='.repeat(50) + '\n');
        process.exit(1);
    }
}

checkTables();
