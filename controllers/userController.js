import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import Progress from '../models/Progress.js';

class UserController {
  static async getProfile(req, res) {
    try {
      const profile = await User.findById(req.userId);

      const userProfile = {
        id: req.user.id,
        email: req.user.email,
        name: profile?.name || req.user.name || '',
        avatar_url: profile?.avatarUrl || '',
        theme: profile?.theme || 'light',
        created_at: profile?.createdAt || req.user.createdAt
      };

      res.json(userProfile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, avatar_url, theme } = req.body;

      // Check if profile exists
      const existingProfile = await User.findById(req.userId);

      let profile;

      if (existingProfile) {
        profile = await User.update(req.userId, {
          name,
          avatarUrl: avatar_url,
          theme
        });
      } else {
        profile = await User.create({
          id: req.userId,
          email: req.user.email,
          name: name || '',
          avatarUrl: avatar_url || '',
          theme: theme || 'light'
        });
      }

      // Transform to expected format
      const formattedProfile = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: profile.avatarUrl,
        theme: profile.theme,
        created_at: profile.createdAt,
        updated_at: profile.updatedAt
      };

      res.json(formattedProfile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async getDashboard(req, res) {
    try {
      // Get all habits
      const habits = await Habit.findByUserId(req.userId);

      // Get today's progress
      const today = new Date().toISOString().split('T')[0];
      const todayProgressRows = await Progress.findByDateRange(req.userId, {
        startDate: today,
        endDate: today
      });

      // Calculate statistics
      const totalHabits = habits.length;
      const activeHabits = habits.filter(h => h.isActive).length;
      const completedToday = todayProgressRows.filter(p => p.progress.completed).length;
      const totalCompletions = habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0);
      const longestStreak = Math.max(...habits.map(h => h.currentStreak || 0), 0);

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const startDate = sevenDaysAgo.toISOString().split('T')[0];

      const recentActivityRows = await Progress.findByDateRange(req.userId, {
        startDate,
        endDate: today
      });

      const dashboardData = {
        totalHabits,
        activeHabits,
        completedToday,
        totalCompletions,
        longestStreak,
        recentActivity: recentActivityRows.map(row => ({
          date: row.progress.date,
          completed: row.progress.completed
        }))
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async deleteAccount(req, res) {
    try {
      await User.delete(req.userId);

      res.json({ message: 'Account data deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }
}

export default UserController;
