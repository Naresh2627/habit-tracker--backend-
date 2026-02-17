import { eq, and, gte, lte, desc, asc, count } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

class Progress {
  static async findByDateRange(userId, filters = {}) {
    let conditions = [eq(schema.progress.userId, userId)];

    if (filters.habitId) {
      conditions.push(eq(schema.progress.habitId, filters.habitId));
    }

    if (filters.startDate && filters.endDate) {
      conditions.push(gte(schema.progress.date, filters.startDate));
      conditions.push(lte(schema.progress.date, filters.endDate));
    }

    const progressRows = await db
      .select({
        progress: schema.progress,
        habit: schema.habits
      })
      .from(schema.progress)
      .leftJoin(schema.habits, eq(schema.progress.habitId, schema.habits.id))
      .where(and(...conditions))
      .orderBy(desc(schema.progress.date), asc(schema.progress.habitId));

    return progressRows;
  }

  static async findByDate(userId, habitId, date) {
    const progressRows = await db
      .select()
      .from(schema.progress)
      .where(and(
        eq(schema.progress.userId, userId),
        eq(schema.progress.habitId, habitId),
        eq(schema.progress.date, date)
      ))
      .limit(1);

    return progressRows[0] || null;
  }

  static async create(progressData) {
    const { userId, habitId, date, completed = true, notes = '' } = progressData;

    const [progress] = await db
      .insert(schema.progress)
      .values({
        userId,
        habitId,
        date,
        completed,
        notes
      })
      .returning();

    return progress;
  }

  static async update(progressId, updateData) {
    const data = {
      completed: updateData.completed,
      notes: updateData.notes,
      updatedAt: new Date()
    };

    const [progress] = await db
      .update(schema.progress)
      .set(data)
      .where(eq(schema.progress.id, progressId))
      .returning();

    return progress;
  }

  static async delete(progressId, userId) {
    await db
      .delete(schema.progress)
      .where(and(
        eq(schema.progress.id, progressId),
        eq(schema.progress.userId, userId)
      ));
    return true;
  }

  static async getTodayProgress(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    // Get all active habits
    const habitsRows = await db
      .select()
      .from(schema.habits)
      .where(and(
        eq(schema.habits.userId, userId),
        eq(schema.habits.isActive, true)
      ))
      .orderBy(desc(schema.habits.createdAt));

    // Get today's progress
    const progressRows = await db
      .select()
      .from(schema.progress)
      .where(and(
        eq(schema.progress.userId, userId),
        eq(schema.progress.date, todayString)
      ));

    return { habits: habitsRows, progress: progressRows };
  }

  static async getCompletedProgress(habitId, userId) {
    const progressRows = await db
      .select({ date: schema.progress.date, completed: schema.progress.completed })
      .from(schema.progress)
      .where(and(
        eq(schema.progress.habitId, habitId),
        eq(schema.progress.userId, userId),
        eq(schema.progress.completed, true)
      ))
      .orderBy(desc(schema.progress.date));

    return progressRows;
  }

  static async getCompletionCount(habitId, userId) {
    const completionRows = await db
      .select({ count: count() })
      .from(schema.progress)
      .where(and(
        eq(schema.progress.habitId, habitId),
        eq(schema.progress.userId, userId),
        eq(schema.progress.completed, true)
      ));

    return completionRows[0]?.count || 0;
  }

  static async getStats(userId, filters = {}) {
    const { habitId, days = 30 } = filters;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const endDateString = endDate.toISOString().split('T')[0];
    const startDateString = startDate.toISOString().split('T')[0];

    let conditions = [
      eq(schema.progress.userId, userId),
      gte(schema.progress.date, startDateString),
      lte(schema.progress.date, endDateString)
    ];

    if (habitId) {
      conditions.push(eq(schema.progress.habitId, habitId));
    }

    const progressRows = await db
      .select()
      .from(schema.progress)
      .where(and(...conditions));

    return progressRows;
  }
}

export default Progress;
