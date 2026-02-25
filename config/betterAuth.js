import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, schema } from '../db/index.js';

const isProd = process.env.NODE_ENV === 'production';
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3005').replace(/\/$/, '');

const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification
        }
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: `${process.env.BETTER_AUTH_URL || 'http://localhost:5000'}/api/auth/better`,
    trustedOrigins: [
        clientUrl
    ],
    advanced: {
        cookiePrefix: 'better-auth',
        useSecureCookies: isProd,
        crossSubDomainCookies: {
            enabled: false
        },
        defaultCookieAttributes: {
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
            httpOnly: true,
            path: '/'
        }
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update session every 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5 // Cache for 5 minutes
        }
    },
    user: {
        additionalFields: {
            name: {
                type: 'string',
                required: false
            }
        }
    },
    socialProviders: process.env.GOOGLE_CLIENT_ID ? {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectURI: `${process.env.BETTER_AUTH_URL || 'http://localhost:5000'}/api/auth/better/callback/google`,
            // After OAuth callback, redirect to client app
            callbackURL: clientUrl
        }
    } : {}
});


export default auth;
