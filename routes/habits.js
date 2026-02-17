import express from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import HabitController from '../controllers/habitController.js';

const router = express.Router();

// @route   GET /api/habits
// @desc    Get all habits for authenticated user
// @access  Private
router.get('/', auth, HabitController.getAll);

// @route   POST /api/habits
// @desc    Create a new habit
// @access  Private
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1 }).withMessage('Habit name is required'),
  body('category').optional().trim(),
  body('emoji').optional().trim(),
  body('color').optional().trim()
], HabitController.create);

// @route   PUT /api/habits/:id
// @desc    Update a habit
// @access  Private
router.put('/:id', auth, HabitController.update);

// @route   DELETE /api/habits/:id
// @desc    Delete a habit
// @access  Private
router.delete('/:id', auth, HabitController.delete);

// @route   GET /api/habits/categories
// @desc    Get all categories for user
// @access  Private
router.get('/categories', auth, HabitController.getCategories);

export default router;