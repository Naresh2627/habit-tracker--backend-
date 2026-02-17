import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

async function checkVerificationTable() {
    try {
        console.log('\n🔍 Checking verification table...\n');

        // Check if table exists
        const tableCheck = await db.execute(sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'verification'
            );
        `);
        
        console.log('✅ Verification table exists:', tableCheck.rows[0].exists);

        // Check table structure
        const columns = await db.execute(sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'verification'
            ORDER BY ordinal_position;
        `);

        console.log('\n📋 Table structure:');
        columns.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });

        // Check for any existing verification records
        const records = await db.execute(sql`
            SELECT id, identifier, expires_at, created_at
            FROM verification
            ORDER BY created_at DESC
            LIMIT 5;
        `);

        console.log(`\n📊 Recent verification records: ${records.rows.length}`);
        if (records.rows.length > 0) {
            records.rows.forEach(record => {
                const isExpired = new Date(record.expires_at) < new Date();
                console.log(`  - ID: ${record.id.substring(0, 20)}... | Expires: ${record.expires_at} | Expired: ${isExpired}`);
            });
        }

        // Clean up expired records
        const cleanup = await db.execute(sql`
            DELETE FROM verification
            WHERE expires_at < NOW()
            RETURNING id;
        `);

        console.log(`\n🧹 Cleaned up ${cleanup.rows.length} expired verification records`);

        console.log('\n✅ Verification table check complete!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking verification table:', error);
        process.exit(1);
    }
}

checkVerificationTable();
