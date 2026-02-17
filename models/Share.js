import { eq, and, gte, desc } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

class Share {
  static async create(shareData) {
    const {
      userId,
      shareId,
      title,
      description = '',
      includeStats = true,
      includeHabits = true,
      stats = null,
      habits = null
    } = shareData;

    const [shareRecord] = await db
      .insert(schema.sharedProgress)
      .values({
        userId,
        shareId,
        title,
        description,
        includeStats,
        includeHabits,
        stats,
        habits
      })
      .returning();

    return shareRecord;
  }

  static async findByShareId(shareId) {
    const shareRows = await db
      .select()
      .from(schema.sharedProgress)
      .where(eq(schema.sharedProgress.shareId, shareId))
      .limit(1);

    return shareRows[0] || null;
  }

  static async findByUserId(userId) {
    const sharedLinksRows = await db
      .select({
        shareId: schema.sharedProgress.shareId,
        title: schema.sharedProgress.title,
        description: schema.sharedProgress.description,
        createdAt: schema.sharedProgress.createdAt,
        expiresAt: schema.sharedProgress.expiresAt
      })
      .from(schema.sharedProgress)
      .where(eq(schema.sharedProgress.userId, userId))
      .orderBy(desc(schema.sharedProgress.createdAt));

    return sharedLinksRows;
  }

  static async delete(shareId, userId) {
    await db
      .delete(schema.sharedProgress)
      .where(and(
        eq(schema.sharedProgress.shareId, shareId),
        eq(schema.sharedProgress.userId, userId)
      ));

    return true;
  }

  static async getShareableStats(userId) {
    // Get user profile
    const profileRows = await db
      .select({ name: schema.profiles.name, avatarUrl: schema.profiles.avatarUrl })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);

    const profile = profileRows[0];

    // Get habits with streaks
    const habitsRows = await db
      .select({
        name: schema.habits.name,
        emoji: schema.habits.emoji,
        currentStreak: schema.habits.currentStreak,
        longestStreak: schema.habits.longestStreak,
        totalCompletions: schema.habits.totalCompletions
      })
      .from(schema.habits)
      .where(and(
        eq(schema.habits.userId, userId),
        eq(schema.habits.isActive, true)
      ))
      .orderBy(desc(schema.habits.currentStreak));

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    const recentActivityRows = await db
      .select({ date: schema.progress.date, completed: schema.progress.completed })
      .from(schema.progress)
      .where(and(
        eq(schema.progress.userId, userId),
        gte(schema.progress.date, startDate)
      ));

    return { profile, habits: habitsRows, recentActivity: recentActivityRows };
  }
}

export default Share;
