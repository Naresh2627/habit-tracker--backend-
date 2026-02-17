import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 DATABASE_URL Parsing Test\n');
console.log('='.repeat(50));

const dbUrl = process.env.DATABASE_URL;
console.log('\nRaw DATABASE_URL:', dbUrl);

try {
    const url = new URL(dbUrl);
    console.log('\nParsed components:');
    console.log('  Protocol:', url.protocol);
    console.log('  Hostname:', url.hostname);
    console.log('  Port:', url.port);
    console.log('  Username:', url.username);
    console.log('  Password (raw):', url.password);
    console.log('  Password (decoded):', decodeURIComponent(url.password));
    console.log('  Pathname:', url.pathname);
    console.log('  Database:', url.pathname.slice(1));
} catch (error) {
    console.error('\n❌ Error parsing URL:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');
