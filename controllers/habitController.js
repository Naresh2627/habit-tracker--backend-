import { validationResult } from 'express-validator';
import Habit from '../models/Habit.js';

class HabitController {
  static async getAll(req, res) {
    try {
      const { active, category, sort } = req.query;

      const habits = await Habit.findByUserId(req.userId, { active, category, sort });

      // Transform to match expected format
      const formattedHabits = habits.map(h => ({
        id: h.id,
        user_id: h.userId,
        name: h.name,
        description: h.description,
        emoji: h.emoji,
        category: h.category,
        color: h.color,
        is_active: h.isActive,
        current_streak: h.currentStreak,
        longest_streak: h.longestStreak,
        total_completions: h.totalCompletions,
        created_at: h.createdAt,
        updated_at: h.updatedAt
      }));

      res.json(formattedHabits || []);
    } catch (error) {
      console.error('Get habits error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, description, emoji, category, color } = req.body;

      const habit = await Habit.create({
        userId: req.userId,
        name,
        description,
        emoji,
        category,
        color
      });

      // Transform to match expected format
      const formattedHabit = {
        id: habit.id,
        user_id: habit.userId,
        name: habit.name,
        description: habit.description,
        emoji: habit.emoji,
        category: habit.category,
        color: habit.color,
        is_active: habit.isActive,
        current_streak: habit.currentStreak,
        longest_streak: habit.longestStreak,
        total_completions: habit.totalCompletions,
        created_at: habit.createdAt,
        updated_at: habit.updatedAt
      };

      res.status(201).json(formattedHabit);
    } catch (error) {
      console.error('Create habit error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async update(req, res) {
    try {
      const { name, description, emoji, category, color, is_active } = req.body;
      const habitId = req.params.id;

      // Check if habit exists and belongs to user
      const existingHabit = await Habit.findById(habitId, req.userId);

      if (!existingHabit) {
        return res.status(404).json({
          message: 'Habit not found',
          code: 'NOT_FOUND'
        });
      }

      const habit = await Habit.update(habitId, req.userId, {
        name,
        description,
        emoji,
        category,
        color,
        is_active
      });

      // Transform to match expected format
      const formattedHabit = {
        id: habit.id,
        user_id: habit.userId,
        name: habit.name,
        description: habit.description,
        emoji: habit.emoji,
        category: habit.category,
        color: habit.color,
        is_active: habit.isActive,
        current_streak: habit.currentStreak,
        longest_streak: habit.longestStreak,
        total_completions: habit.totalCompletions,
        created_at: habit.createdAt,
        updated_at: habit.updatedAt
      };

      res.json(formattedHabit);
    } catch (error) {
      console.error('Update habit error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async delete(req, res) {
    try {
      const habitId = req.params.id;

      // Check if habit exists and belongs to user
      const existingHabit = await Habit.findById(habitId, req.userId);

      if (!existingHabit) {
        return res.status(404).json({
          message: 'Habit not found',
          code: 'NOT_FOUND'
        });
      }

      await Habit.delete(habitId, req.userId);

      res.json({ message: 'Habit deleted successfully' });
    } catch (error) {
      console.error('Delete habit error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async getCategories(req, res) {
    try {
      const categories = await Habit.getCategories(req.userId);
      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }
}

export default HabitController;
