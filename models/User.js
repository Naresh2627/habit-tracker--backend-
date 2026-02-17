import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

class User {
  static async findById(userId) {
    const profileRows = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);

    return profileRows[0] || null;
  }

  static async create(userData) {
    const { id, email, name, avatarUrl = '', theme = 'light' } = userData;

    const [profile] = await db
      .insert(schema.profiles)
      .values({
        id,
        email,
        name,
        avatarUrl,
        theme
      })
      .onConflictDoNothing()
      .returning();

    return profile;
  }

  static async update(userId, updateData) {
    const data = { updatedAt: new Date() };
    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.avatarUrl !== undefined) data.avatarUrl = updateData.avatarUrl;
    if (updateData.theme !== undefined) data.theme = updateData.theme;

    const [profile] = await db
      .update(schema.profiles)
      .set(data)
      .where(eq(schema.profiles.id, userId))
      .returning();

    return profile;
  }

  static async delete(userId) {
    // Delete user's progress
    await db
      .delete(schema.progress)
      .where(eq(schema.progress.userId, userId));

    // Delete user's habits
    await db
      .delete(schema.habits)
      .where(eq(schema.habits.userId, userId));

    // Delete user's profile
    await db
      .delete(schema.profiles)
      .where(eq(schema.profiles.id, userId));

    // Delete user's shared progress
    await db
      .delete(schema.sharedProgress)
      .where(eq(schema.sharedProgress.userId, userId));

    return true;
  }
}

export default User;
