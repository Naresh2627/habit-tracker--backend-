// Quick fix for authentication - deletes all users and prepares for fresh registration
import dotenv from 'dotenv';
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

dotenv.config();

console.log('\n🔧 Authentication Quick Fix\n');
console.log('='.repeat(50));

async function quickFix() {
    try {
        console.log('\n1️⃣  Checking current state...');
        
        // Check users
        const users = await db.execute(sql`SELECT COUNT(*) as count FROM "user"`);
        const userCount = users.rows[0].count;
        console.log(`   Users in database: ${userCount}`);

        // Check accounts
        const accounts = await db.execute(sql`SELECT COUNT(*) as count FROM "account"`);
        const accountCount = accounts.rows[0].count;
        console.log(`   Accounts in database: ${accountCount}`);

        if (userCount > accountCount) {
            console.log(`   ⚠️  Problem detected: ${userCount} users but only ${accountCount} accounts`);
            console.log('   This means some users don\'t have passwords!');
        }

        console.log('\n2️⃣  Cleaning up...');
        
        // Delete all data (cascade will handle related records)
        await db.execute(sql`DELETE FROM "session"`);
        await db.execute(sql`DELETE FROM "account"`);
        await db.execute(sql`DELETE FROM "verification"`);
        await db.execute(sql`DELETE FROM "profiles"`);
        await db.execute(sql`DELETE FROM "progress"`);
        await db.execute(sql`DELETE FROM "habits"`);
        await db.execute(sql`DELETE FROM "shared_progress"`);
        await db.execute(sql`DELETE FROM "user"`);

        console.log('   ✅ All users and data deleted');

        console.log('\n3️⃣  Verifying password column exists...');
        
        // Check if password column exists
        const columns = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'account' AND column_name = 'password'
        `);

        if (columns.rows.length === 0) {
            console.log('   Adding password column...');
            await db.execute(sql`ALTER TABLE "account" ADD COLUMN "password" text`);
            console.log('   ✅ Password column added');
        } else {
            console.log('   ✅ Password column exists');
        }

        console.log('\n✅ Authentication fixed!\n');
        console.log('Next steps:');
        console.log('  1. Make sure server is running: npm start');
        console.log('  2. Go to: http://localhost:3005/register');
        console.log('  3. Register a new account');
        console.log('  4. Try to login - it should work now!');
        console.log('\n' + '='.repeat(50) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

quickFix();
