import express from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import UserController from '../controllers/userController.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, UserController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('theme').optional().isIn(['light', 'dark']).withMessage('Theme must be light or dark')
], UserController.updateProfile);

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, UserController.getDashboard);

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, UserController.deleteAccount);

export default router;
