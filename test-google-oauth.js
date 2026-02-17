// Quick test script to verify Google OAuth configuration
import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 Google OAuth Configuration Test\n');
console.log('=' .repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('  GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('  GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('  BETTER_AUTH_URL:', process.env.BETTER_AUTH_URL || 'http://localhost:5000');
console.log('  CLIENT_URL:', process.env.CLIENT_URL || 'http://localhost:3005');

// Check values (partial for security)
if (process.env.GOOGLE_CLIENT_ID) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    console.log('\n🔑 Client ID (partial):', clientId.substring(0, 20) + '...');
    
    if (!clientId.includes('.apps.googleusercontent.com')) {
        console.log('  ⚠️  Warning: Client ID should end with .apps.googleusercontent.com');
    }
}

if (process.env.GOOGLE_CLIENT_SECRET) {
    const secret = process.env.GOOGLE_CLIENT_SECRET;
    console.log('🔐 Client Secret (partial):', secret.substring(0, 10) + '...');
    
    if (!secret.startsWith('GOCSPX-')) {
        console.log('  ⚠️  Warning: Client Secret should start with GOCSPX-');
    }
}

// Expected URLs
console.log('\n🌐 Expected URLs:');
console.log('  Better Auth Base:', `${process.env.BETTER_AUTH_URL || 'http://localhost:5000'}/api/auth/better`);
console.log('  OAuth Callback:', `${process.env.BETTER_AUTH_URL || 'http://localhost:5000'}/api/auth/better/callback/google`);
console.log('  Client URL:', process.env.CLIENT_URL || 'http://localhost:3005');

// Configuration status
console.log('\n✅ Configuration Status:');
const isConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
console.log('  Google OAuth:', isConfigured ? '✓ Configured' : '✗ Not Configured');

if (isConfigured) {
    console.log('\n🎉 Google OAuth is properly configured!');
    console.log('\n📝 Next steps:');
    console.log('  1. Make sure Google Cloud Console redirect URI is:');
    console.log('     http://localhost:5000/api/auth/better/callback/google');
    console.log('  2. Restart your server: npm start');
    console.log('  3. Test login at: http://localhost:3005/login');
} else {
    console.log('\n❌ Google OAuth is NOT configured!');
    console.log('\n📝 To fix:');
    console.log('  1. Get credentials from Google Cloud Console');
    console.log('  2. Add to server/.env:');
    console.log('     GOOGLE_CLIENT_ID=your-client-id');
    console.log('     GOOGLE_CLIENT_SECRET=your-client-secret');
    console.log('  3. Restart your server');
}

console.log('\n' + '='.repeat(50) + '\n');
