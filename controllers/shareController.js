import Share from '../models/Share.js';
import User from '../models/User.js';

class ShareController {
  static async getShareableStats(req, res) {
    try {
      const { profile, habits, recentActivity } = await Share.getShareableStats(req.userId);

      // Calculate overall stats
      const totalHabits = habits.length;
      const totalCompletions = habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0);
      const longestStreak = Math.max(...habits.map(h => h.longestStreak || 0), 0);
      const currentStreaks = habits.map(h => h.currentStreak || 0);
      const averageStreak = currentStreaks.length > 0
        ? Math.round(currentStreaks.reduce((sum, s) => sum + s, 0) / currentStreaks.length)
        : 0;

      // Group activity by date
      const activityByDate = {};
      if (recentActivity) {
        recentActivity.forEach(activity => {
          if (!activityByDate[activity.date]) {
            activityByDate[activity.date] = { completed: 0, total: 0 };
          }
          activityByDate[activity.date].total++;
          if (activity.completed) {
            activityByDate[activity.date].completed++;
          }
        });
      }

      const shareableStats = {
        user: {
          name: profile?.name || 'Anonymous',
          avatar_url: profile?.avatarUrl || ''
        },
        stats: {
          totalHabits,
          totalCompletions,
          longestStreak,
          averageStreak
        },
        topHabits: habits.slice(0, 5).map(h => ({
          name: h.name,
          emoji: h.emoji,
          currentStreak: h.currentStreak,
          longestStreak: h.longestStreak
        })),
        activityChart: activityByDate,
        generatedAt: new Date().toISOString()
      };

      res.json(shareableStats);
    } catch (error) {
      console.error('Get shareable stats error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async createShare(req, res) {
    try {
      const { title, description, includeStats, includeHabits } = req.body;

      // Generate a unique share ID
      const shareId = `${req.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get data to share based on preferences
      const { profile, habits } = await Share.getShareableStats(req.userId);

      let stats = null;
      let habitsData = null;

      if (includeStats !== false && habits.length > 0) {
        stats = {
          totalHabits: habits.length,
          totalCompletions: habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0),
          longestStreak: Math.max(...habits.map(h => h.longestStreak || 0), 0)
        };
      }

      if (includeHabits !== false && habits.length > 0) {
        habitsData = habits.slice(0, 5).map(h => ({
          name: h.name,
          emoji: h.emoji,
          currentStreak: h.currentStreak
        }));
      }

      // Store shareable data
      const shareRecord = await Share.create({
        userId: req.userId,
        shareId,
        title: title || 'My Habit Progress',
        description: description || '',
        includeStats: includeStats !== false,
        includeHabits: includeHabits !== false,
        stats,
        habits: habitsData
      });

      const shareUrl = `${process.env.CLIENT_URL}/share/${shareId}`;

      res.status(201).json({
        shareId,
        shareUrl,
        shareRecord: {
          id: shareRecord.id,
          user_id: shareRecord.userId,
          share_id: shareRecord.shareId,
          title: shareRecord.title,
          description: shareRecord.description,
          include_stats: shareRecord.includeStats,
          include_habits: shareRecord.includeHabits,
          stats: shareRecord.stats,
          habits: shareRecord.habits,
          created_at: shareRecord.createdAt
        }
      });
    } catch (error) {
      console.error('Create share error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async getSharedProgress(req, res) {
    try {
      const { shareId } = req.params;

      const shareRecord = await Share.findByShareId(shareId);

      if (!shareRecord) {
        return res.status(404).json({
          message: 'Shared progress not found',
          code: 'NOT_FOUND'
        });
      }

      // Check if expired
      if (shareRecord.expiresAt && new Date(shareRecord.expiresAt) < new Date()) {
        return res.status(410).json({
          message: 'Shared progress has expired',
          code: 'EXPIRED'
        });
      }

      // Get user profile for display
      const profile = await User.findById(shareRecord.userId);

      const responseData = {
        title: shareRecord.title,
        description: shareRecord.description,
        user: {
          name: profile?.name || 'Anonymous User',
          avatar_url: profile?.avatarUrl || ''
        },
        createdAt: shareRecord.createdAt
      };

      if (shareRecord.includeStats && shareRecord.stats) {
        responseData.stats = shareRecord.stats;
      }

      if (shareRecord.includeHabits && shareRecord.habits) {
        responseData.habits = shareRecord.habits;
      }

      res.json(responseData);
    } catch (error) {
      console.error('Get shared progress error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async getUserLinks(req, res) {
    try {
      const sharedLinks = await Share.findByUserId(req.userId);

      const linksWithUrls = sharedLinks.map(link => ({
        share_id: link.shareId,
        title: link.title,
        description: link.description,
        created_at: link.createdAt,
        expires_at: link.expiresAt,
        shareUrl: `${process.env.CLIENT_URL}/share/${link.shareId}`
      }));

      res.json(linksWithUrls);
    } catch (error) {
      console.error('Get user shared links error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  static async deleteShare(req, res) {
    try {
      const { shareId } = req.params;

      await Share.delete(shareId, req.userId);

      res.json({ message: 'Shared link deleted successfully' });
    } catch (error) {
      console.error('Delete share error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }
}

export default ShareController;
