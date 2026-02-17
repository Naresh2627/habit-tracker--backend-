import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 OAuth Configuration Check\n');
console.log('=' .repeat(60));

console.log('\n📋 Environment Variables:');
console.log('  GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('  GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('  BETTER_AUTH_URL:', process.env.BETTER_AUTH_URL || 'http://localhost:5000');
console.log('  CLIENT_URL:', process.env.CLIENT_URL || 'http://localhost:3005');

console.log('\n🔗 Expected OAuth URLs:');
const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:5000';
console.log('  Better Auth Base:', `${baseURL}/api/auth/better`);
console.log('  OAuth Callback:', `${baseURL}/api/auth/better/callback/google`);
console.log('  OAuth Initiate:', `${baseURL}/api/auth/better/sign-in/social`);

console.log('\n✅ Add these to Google Cloud Console:');
console.log('\n  Authorized redirect URIs:');
console.log(`    ${baseURL}/api/auth/better/callback/google`);

console.log('\n  Authorized JavaScript origins:');
console.log(`    ${baseURL}`);
console.log(`    ${process.env.CLIENT_URL || 'http://localhost:3005'}`);

console.log('\n' + '='.repeat(60));
console.log('\n📝 Steps to fix in Google Cloud Console:');
console.log('  1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('  2. Click on your OAuth 2.0 Client ID');
console.log('  3. Add the redirect URI shown above');
console.log('  4. Add the JavaScript origins shown above');
console.log('  5. Click Save');
console.log('  6. Wait 5 minutes for changes to propagate');
console.log('\n');
