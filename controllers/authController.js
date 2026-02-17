import { validationResult } from 'express-validator';
import auth from '../config/betterAuth.js';
import User from '../models/User.js';

class AuthController {
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password, name } = req.body;

      // Better Auth handles registration through its own endpoints
      // We should let the client use Better Auth directly
      // This endpoint is for additional server-side logic if needed
      
      res.status(400).json({
        message: 'Please use Better Auth client for registration',
        code: 'USE_CLIENT_AUTH',
        hint: 'Registration should be done through the Better Auth client endpoints'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR',
        error: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Sign in with Better Auth
      const result = await auth.api.signInEmail({
        body: { email, password }
      });

      if (result.error) {
        return res.status(401).json({
          message: result.error.message || 'Invalid credentials',
          code: 'LOGIN_ERROR'
        });
      }

      // Get user profile
      const profile = await User.findById(result.user.id);

      res.json({
        message: 'Login successful',
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: profile?.name || result.user.name || '',
          avatar_url: profile?.avatarUrl || '',
          theme: profile?.theme || 'light'
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async googleAuth(req, res) {
    try {
      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(400).json({
          message: 'Google OAuth is not configured',
          code: 'GOOGLE_NOT_CONFIGURED'
        });
      }

      const result = await auth.api.signInSocial({
        body: {
          provider: 'google',
          callbackURL: `${process.env.CLIENT_URL}/auth/callback`
        }
      });

      if (result.error) {
        return res.status(400).json({
          message: result.error.message,
          code: 'GOOGLE_AUTH_ERROR'
        });
      }

      res.json({ url: result.url });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async getCurrentUser(req, res) {
    try {
      const profile = await User.findById(req.userId);

      const user = {
        id: req.user.id,
        email: req.user.email,
        name: profile?.name || req.user.name || '',
        avatar_url: profile?.avatarUrl || '',
        theme: profile?.theme || 'light'
      };

      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async logout(req, res) {
    try {
      await auth.api.signOut({
        headers: req.headers
      });

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }
}

export default AuthController;
