// Check users in database
import dotenv from 'dotenv';
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

dotenv.config();

console.log('\n👥 Users in Database\n');
console.log('='.repeat(50));

async function checkUsers() {
    try {
        // Get all users
        const users = await db.execute(sql`
            SELECT id, email, name, email_verified, created_at
            FROM "user"
            ORDER BY created_at DESC;
        `);

        console.log(`\nTotal users: ${users.rows.length}\n`);

        if (users.rows.length === 0) {
            console.log('No users found in database.');
        } else {
            users.rows.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email}`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Name: ${user.name || 'Not set'}`);
                console.log(`   Email Verified: ${user.email_verified}`);
                console.log(`   Created: ${user.created_at}`);
                console.log('');
            });
        }

        // Check accounts (for OAuth)
        const accounts = await db.execute(sql`
            SELECT user_id, provider_id, account_id
            FROM "account";
        `);

        if (accounts.rows.length > 0) {
            console.log('\n🔐 OAuth Accounts:');
            accounts.rows.forEach(acc => {
                console.log(`   User: ${acc.user_id}`);
                console.log(`   Provider: ${acc.provider_id}`);
                console.log(`   Account ID: ${acc.account_id}`);
                console.log('');
            });
        }

        // Check sessions
        const sessions = await db.execute(sql`
            SELECT user_id, expires_at, created_at
            FROM "session"
            ORDER BY created_at DESC
            LIMIT 5;
        `);

        if (sessions.rows.length > 0) {
            console.log('\n🔑 Recent Sessions:');
            sessions.rows.forEach(session => {
                console.log(`   User: ${session.user_id}`);
                console.log(`   Expires: ${session.expires_at}`);
                console.log(`   Created: ${session.created_at}`);
                console.log('');
            });
        }

        console.log('='.repeat(50) + '\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

checkUsers();
