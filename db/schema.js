import { pgTable, text, boolean, timestamp, uuid, integer, date, jsonb, unique } from 'drizzle-orm/pg-core';

// Better Auth required tables
const user = pgTable('user', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false),
    name: text('name'),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

const session = pgTable('session', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

const account = pgTable('account', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    password: text('password'), // For email/password authentication
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    idToken: text('id_token'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

const verification = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

// Application tables
const profiles = pgTable('profiles', {
    id: text('id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    avatarUrl: text('avatar_url').default(''),
    theme: text('theme').default('light'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

const habits = pgTable('habits', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').default(''),
    emoji: text('emoji').default('✅'),
    category: text('category').default('General'),
    color: text('color').default('#3B82F6'),
    isActive: boolean('is_active').default(true),
    currentStreak: integer('current_streak').default(0),
    longestStreak: integer('longest_streak').default(0),
    totalCompletions: integer('total_completions').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

const progress = pgTable('progress', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    completed: boolean('completed').default(false),
    notes: text('notes').default(''),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
    uniqueUserHabitDate: unique().on(table.userId, table.habitId, table.date)
}));

const sharedProgress = pgTable('shared_progress', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    shareId: text('share_id').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').default(''),
    includeStats: boolean('include_stats').default(true),
    includeHabits: boolean('include_habits').default(true),
    stats: jsonb('stats'),
    habits: jsonb('habits'),
    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at')
});

export {
    user,
    session,
    account,
    verification,
    profiles,
    habits,
    progress,
    sharedProgress
};
