import express from 'express';
import { body } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import AuthController from '../controllers/authController.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
], AuthController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], AuthController.login);

// @route   POST /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.post('/google', AuthController.googleAuth);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware, AuthController.getCurrentUser);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authMiddleware, AuthController.logout);

export default router;