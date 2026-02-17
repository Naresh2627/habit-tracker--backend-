// Reset a user (delete and allow fresh registration)
import dotenv from 'dotenv';
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🔄 Reset User Account\n');
console.log('='.repeat(50));

async function resetUser() {
    try {
        // Get all users
        const users = await db.execute(sql`
            SELECT id, email, name
            FROM "user"
            ORDER BY created_at DESC;
        `);

        if (users.rows.length === 0) {
            console.log('\nNo users found in database.');
            process.exit(0);
        }

        console.log('\nUsers in database:\n');
        users.rows.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (${user.name || 'No name'})`);
        });

        rl.question('\nEnter email to reset (or "all" to reset all): ', async (answer) => {
            try {
                if (answer.toLowerCase() === 'all') {
                    // Delete all users and related data
                    await db.execute(sql`DELETE FROM "session"`);
                    await db.execute(sql`DELETE FROM "account"`);
                    await db.execute(sql`DELETE FROM "profiles"`);
                    await db.execute(sql`DELETE FROM "progress"`);
                    await db.execute(sql`DELETE FROM "habits"`);
                    await db.execute(sql`DELETE FROM "shared_progress"`);
                    await db.execute(sql`DELETE FROM "user"`);
                    
                    console.log('\n✅ All users and data deleted successfully');
                } else {
                    // Delete specific user
                    const result = await db.execute(sql`
                        DELETE FROM "user"
                        WHERE email = ${answer}
                        RETURNING id;
                    `);

                    if (result.rows.length > 0) {
                        console.log(`\n✅ User ${answer} deleted successfully`);
                    } else {
                        console.log(`\n❌ User ${answer} not found`);
                    }
                }

                console.log('\nYou can now register again with a fresh account.\n');
                rl.close();
                process.exit(0);
            } catch (error) {
                console.error('\n❌ Error:', error.message);
                rl.close();
                process.exit(1);
            }
        });
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        rl.close();
        process.exit(1);
    }
}

resetUser();
