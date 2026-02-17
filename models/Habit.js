import { eq, and, desc, asc } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

class Habit {
  static async findByUserId(userId, filters = {}) {
    let query = db
      .select()
      .from(schema.habits)
      .where(eq(schema.habits.userId, userId));

    // Apply sorting
    if (filters.sort === 'name') {
      query = query.orderBy(asc(schema.habits.name));
    } else if (filters.sort === 'streak') {
      query = query.orderBy(desc(schema.habits.currentStreak));
    } else {
      query = query.orderBy(desc(schema.habits.createdAt));
    }

    let habits = await query;

    // Filter by active status
    if (filters.active !== undefined) {
      const isActive = filters.active === 'true';
      habits = habits.filter(h => h.isActive === isActive);
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      habits = habits.filter(h => h.category === filters.category);
    }

    return habits;
  }

  static async findById(habitId, userId) {
    const habitRows = await db
      .select()
      .from(schema.habits)
      .where(and(
        eq(schema.habits.id, habitId),
        eq(schema.habits.userId, userId)
      ))
      .limit(1);

    return habitRows[0] || null;
  }

  static async create(habitData) {
    const {
      userId,
      name,
      description = '',
      emoji = '✅',
      category = 'General',
      color = '#3B82F6'
    } = habitData;

    const [habit] = await db
      .insert(schema.habits)
      .values({
        userId,
        name: name.trim(),
        description: description.trim(),
        emoji,
        category: category.trim(),
        color,
        isActive: true,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0
      })
      .returning();

    return habit;
  }

  static async update(habitId, userId, updateData) {
    const data = { updatedAt: new Date() };
    if (updateData.name !== undefined) data.name = updateData.name.trim();
    if (updateData.description !== undefined) data.description = updateData.description.trim();
    if (updateData.emoji !== undefined) data.emoji = updateData.emoji;
    if (updateData.category !== undefined) data.category = updateData.category.trim();
    if (updateData.color !== undefined) data.color = updateData.color;
    if (updateData.is_active !== undefined) data.isActive = updateData.is_active;

    const [habit] = await db
      .update(schema.habits)
      .set(data)
      .where(and(
        eq(schema.habits.id, habitId),
        eq(schema.habits.userId, userId)
      ))
      .returning();

    return habit;
  }

  static async updateStats(habitId, userId, stats) {
    const data = {
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      totalCompletions: stats.totalCompletions,
      updatedAt: new Date()
    };

    await db
      .update(schema.habits)
      .set(data)
      .where(and(
        eq(schema.habits.id, habitId),
        eq(schema.habits.userId, userId)
      ));
  }

  static async delete(habitId, userId) {
    // Delete all progress entries for this habit
    await db
      .delete(schema.progress)
      .where(and(
        eq(schema.progress.habitId, habitId),
        eq(schema.progress.userId, userId)
      ));

    // Delete the habit
    await db
      .delete(schema.habits)
      .where(and(
        eq(schema.habits.id, habitId),
        eq(schema.habits.userId, userId)
      ));

    return true;
  }

  static async getCategories(userId) {
    const habits = await db
      .select({ category: schema.habits.category })
      .from(schema.habits)
      .where(eq(schema.habits.userId, userId));

    const categories = [...new Set(habits.map(h => h.category))].filter(Boolean);
    return categories;
  }
}

export default Habit;
