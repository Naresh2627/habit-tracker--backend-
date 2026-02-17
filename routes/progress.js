import express from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import ProgressController from '../controllers/progressController.js';

const router = express.Router();

// @route   GET /api/progress
// @desc    Get progress for date range
// @access  Private
router.get('/', auth, ProgressController.getProgress);

// @route   POST /api/progress/toggle
// @desc    Toggle habit completion for a date
// @access  Private
router.post('/toggle', [
  auth,
  body('habitId').notEmpty().withMessage('Habit ID is required'),
  body('date').notEmpty().withMessage('Valid date is required')
], ProgressController.toggleProgress);

// @route   GET /api/progress/today
// @desc    Get today's progress for all habits
// @access  Private
router.get('/today', auth, ProgressController.getTodayProgress);

// @route   GET /api/progress/stats
// @desc    Get progress statistics
// @access  Private
router.get('/stats', auth, ProgressController.getStats);

// @route   GET /api/progress/calendar/:year/:month
// @desc    Get calendar view for specific month
// @access  Private
router.get('/calendar/:year/:month', auth, ProgressController.getCalendar);

// @route   DELETE /api/progress/:id
// @desc    Delete a progress entry
// @access  Private
router.delete('/:id', auth, ProgressController.deleteProgress);

export default router;
