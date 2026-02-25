import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { toNodeHandler } from 'better-auth/node';

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const { default: auth } = await import('./config/betterAuth.js');

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('combined'));

// CORS middleware
const allowedOrigins = [
    'https://habit-tracker-backend-1-86at.onrender.com',
    'http://localhost:3005',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Better Auth API handler - must be before other routes
// Handle all Better Auth routes including OAuth callbacks
app.all('/api/auth/better/*', toNodeHandler(auth));
app.all('/api/auth/better', toNodeHandler(auth));

// API Routes
const authRoutes = await import('./routes/auth.js');
const habitsRoutes = await import('./routes/habits.js');
const progressRoutes = await import('./routes/progress.js');
const usersRoutes = await import('./routes/users.js');
const shareRoutes = await import('./routes/share.js');

app.use('/api/auth', authRoutes.default);
app.use('/api/habits', habitsRoutes.default);
app.use('/api/progress', progressRoutes.default);
app.use('/api/users', usersRoutes.default);
app.use('/api/share', shareRoutes.default);

// Health check endpoint
const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        cors: process.env.CLIENT_URL || 'localhost',
        database: 'PostgreSQL with Better Auth',
        googleOAuth: !!process.env.GOOGLE_CLIENT_ID,
        betterAuthURL: `${process.env.BETTER_AUTH_URL || 'http://localhost:5000'}/api/auth/better`
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Habit Tracker API Server',
        status: 'Running',
        version: '2.0.0',
        auth: 'Better Auth',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            habits: '/api/habits',
            progress: '/api/progress',
            users: '/api/users',
            share: '/api/share'
        }
    });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);

    
});