import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pomodoro sessions
export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  duration: integer("duration").notNull(), // in minutes
  type: varchar("type").notNull(), // 'work', 'short_break', 'long_break'
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blocked websites
export const blockedSites = pgTable("blocked_sites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  url: varchar("url").notNull(),
  category: varchar("category"), // 'social_media', 'news', 'entertainment', etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Whitelist websites
export const whitelistSites = pgTable("whitelist_sites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  url: varchar("url").notNull(),
  category: varchar("category"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blocking schedules
export const blockingSchedules = pgTable("blocking_schedules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("start_time").notNull(), // HH:MM format
  endTime: varchar("end_time").notNull(), // HH:MM format
  isActive: boolean("is_active").default(true),
  blockingType: varchar("blocking_type").notNull(), // 'whitelist', 'blacklist'
  createdAt: timestamp("created_at").defaultNow(),
});

// Usage insights
export const usageInsights = pgTable("usage_insights", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  totalProductiveTime: integer("total_productive_time").default(0), // in minutes
  totalDistractedTime: integer("total_distracted_time").default(0), // in minutes
  pomodoroCount: integer("pomodoro_count").default(0),
  sitesBlocked: integer("sites_blocked").default(0),
  focusScore: integer("focus_score").default(0), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

// Nudges/reminders
export const nudges = pgTable("nudges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'focus_reminder', 'break_reminder', 'goal_reminder'
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leaderboard scores
export const leaderboardScores = pgTable("leaderboard_scores", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  weeklyScore: integer("weekly_score").default(0),
  monthlyScore: integer("monthly_score").default(0),
  totalScore: integer("total_score").default(0),
  streakDays: integer("streak_days").default(0),
  lastActiveDate: timestamp("last_active_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  pomodoroSessions: many(pomodoroSessions),
  blockedSites: many(blockedSites),
  whitelistSites: many(whitelistSites),
  blockingSchedules: many(blockingSchedules),
  usageInsights: many(usageInsights),
  nudges: many(nudges),
  leaderboardScore: many(leaderboardScores),
}));

export const pomodoroSessionsRelations = relations(pomodoroSessions, ({ one }) => ({
  user: one(users, {
    fields: [pomodoroSessions.userId],
    references: [users.id],
  }),
}));

export const blockedSitesRelations = relations(blockedSites, ({ one }) => ({
  user: one(users, {
    fields: [blockedSites.userId],
    references: [users.id],
  }),
}));

export const whitelistSitesRelations = relations(whitelistSites, ({ one }) => ({
  user: one(users, {
    fields: [whitelistSites.userId],
    references: [users.id],
  }),
}));

export const blockingSchedulesRelations = relations(blockingSchedules, ({ one }) => ({
  user: one(users, {
    fields: [blockingSchedules.userId],
    references: [users.id],
  }),
}));

export const usageInsightsRelations = relations(usageInsights, ({ one }) => ({
  user: one(users, {
    fields: [usageInsights.userId],
    references: [users.id],
  }),
}));

export const nudgesRelations = relations(nudges, ({ one }) => ({
  user: one(users, {
    fields: [nudges.userId],
    references: [users.id],
  }),
}));

export const leaderboardScoresRelations = relations(leaderboardScores, ({ one }) => ({
  user: one(users, {
    fields: [leaderboardScores.userId],
    references: [users.id],
  }),
}));

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
export type InsertPomodoroSession = typeof pomodoroSessions.$inferInsert;
export type BlockedSite = typeof blockedSites.$inferSelect;
export type InsertBlockedSite = typeof blockedSites.$inferInsert;
export type WhitelistSite = typeof whitelistSites.$inferSelect;
export type InsertWhitelistSite = typeof whitelistSites.$inferInsert;
export type BlockingSchedule = typeof blockingSchedules.$inferSelect;
export type InsertBlockingSchedule = typeof blockingSchedules.$inferInsert;
export type UsageInsight = typeof usageInsights.$inferSelect;
export type InsertUsageInsight = typeof usageInsights.$inferInsert;
export type Nudge = typeof nudges.$inferSelect;
export type InsertNudge = typeof nudges.$inferInsert;
export type LeaderboardScore = typeof leaderboardScores.$inferSelect;
export type InsertLeaderboardScore = typeof leaderboardScores.$inferInsert;