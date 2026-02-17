// Check Better Auth tables structure
import dotenv from 'dotenv';
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

dotenv.config();

console.log('\n🔍 Better Auth Tables Structure\n');
console.log('='.repeat(50));

async function checkTables() {
    try {
        // Check user table columns
        console.log('\n📋 User Table Columns:');
        const userColumns = await db.execute(sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'user'
            ORDER BY ordinal_position;
        `);
        
        userColumns.rows.forEach(col => {
            console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // Check if user has password
        const userWithPassword = await db.execute(sql`
            SELECT id, email, name
            FROM "user"
            LIMIT 1;
        `);

        if (userWithPassword.rows.length > 0) {
            console.log('\n👤 Sample User Data:');
            const user = userWithPassword.rows[0];
            console.log(`   Email: ${user.email}`);
            console.log(`   Name: ${user.name}`);
            console.log(`   ID: ${user.id}`);
        }

        // Check account table (Better Auth uses this for credentials)
        console.log('\n📋 Account Table Columns:');
        const accountColumns = await db.execute(sql`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'account'
            ORDER BY ordinal_position;
        `);
        
        accountColumns.rows.forEach(col => {
            console.log(`   ${col.column_name} (${col.data_type})`);
        });

        // Check if there are any accounts
        const accounts = await db.execute(sql`
            SELECT user_id, provider_id, account_id
            FROM "account";
        `);

        console.log(`\n🔐 Accounts in database: ${accounts.rows.length}`);
        if (accounts.rows.length > 0) {
            accounts.rows.forEach(acc => {
                console.log(`   User: ${acc.user_id}, Provider: ${acc.provider_id}`);
            });
        }

        console.log('\n' + '='.repeat(50) + '\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

checkTables();
