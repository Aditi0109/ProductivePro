import {
  users,
  pomodoroSessions,
  blockedSites,
  whitelistSites,
  blockingSchedules,
  usageInsights,
  nudges,
  leaderboardScores,
  type User,
  type UpsertUser,
  type PomodoroSession,
  type InsertPomodoroSession,
  type BlockedSite,
  type InsertBlockedSite,
  type WhitelistSite,
  type InsertWhitelistSite,
  type BlockingSchedule,
  type InsertBlockingSchedule,
  type UsageInsight,
  type InsertUsageInsight,
  type Nudge,
  type InsertNudge,
  type LeaderboardScore,
  type InsertLeaderboardScore,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Pomodoro operations
  createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession>;
  updatePomodoroSession(id: number, updates: Partial<InsertPomodoroSession>): Promise<PomodoroSession>;
  getUserPomodoroSessions(userId: string, limit?: number): Promise<PomodoroSession[]>;
  
  // Site blocking operations
  addBlockedSite(site: InsertBlockedSite): Promise<BlockedSite>;
  removeBlockedSite(id: number): Promise<void>;
  getUserBlockedSites(userId: string): Promise<BlockedSite[]>;
  
  // Whitelist operations
  addWhitelistSite(site: InsertWhitelistSite): Promise<WhitelistSite>;
  removeWhitelistSite(id: number): Promise<void>;
  getUserWhitelistSites(userId: string): Promise<WhitelistSite[]>;
  
  // Schedule operations
  createBlockingSchedule(schedule: InsertBlockingSchedule): Promise<BlockingSchedule>;
  updateBlockingSchedule(id: number, updates: Partial<InsertBlockingSchedule>): Promise<BlockingSchedule>;
  getUserBlockingSchedules(userId: string): Promise<BlockingSchedule[]>;
  
  // Usage insights
  createUsageInsight(insight: InsertUsageInsight): Promise<UsageInsight>;
  getUserUsageInsights(userId: string, startDate?: Date, endDate?: Date): Promise<UsageInsight[]>;
  
  // Nudges
  createNudge(nudge: InsertNudge): Promise<Nudge>;
  getUserNudges(userId: string): Promise<Nudge[]>;
  markNudgeAsRead(id: number): Promise<void>;
  
  // Leaderboard
  updateLeaderboardScore(userId: string, updates: Partial<InsertLeaderboardScore>): Promise<LeaderboardScore>;
  getLeaderboard(limit?: number): Promise<(LeaderboardScore & { user: User | null })[]>;
  getUserLeaderboardScore(userId: string): Promise<LeaderboardScore | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Pomodoro operations
  async createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession> {
    const [newSession] = await db
      .insert(pomodoroSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updatePomodoroSession(id: number, updates: Partial<InsertPomodoroSession>): Promise<PomodoroSession> {
    const [updatedSession] = await db
      .update(pomodoroSessions)
      .set(updates)
      .where(eq(pomodoroSessions.id, id))
      .returning();
    return updatedSession;
  }

  async getUserPomodoroSessions(userId: string, limit = 50): Promise<PomodoroSession[]> {
    return await db
      .select()
      .from(pomodoroSessions)
      .where(eq(pomodoroSessions.userId, userId))
      .orderBy(desc(pomodoroSessions.createdAt))
      .limit(limit);
  }

  // Site blocking operations
  async addBlockedSite(site: InsertBlockedSite): Promise<BlockedSite> {
    const [newSite] = await db
      .insert(blockedSites)
      .values(site)
      .returning();
    return newSite;
  }

  async removeBlockedSite(id: number): Promise<void> {
    await db.delete(blockedSites).where(eq(blockedSites.id, id));
  }

  async getUserBlockedSites(userId: string): Promise<BlockedSite[]> {
    return await db
      .select()
      .from(blockedSites)
      .where(and(eq(blockedSites.userId, userId), eq(blockedSites.isActive, true)));
  }

  // Whitelist operations
  async addWhitelistSite(site: InsertWhitelistSite): Promise<WhitelistSite> {
    const [newSite] = await db
      .insert(whitelistSites)
      .values(site)
      .returning();
    return newSite;
  }

  async removeWhitelistSite(id: number): Promise<void> {
    await db.delete(whitelistSites).where(eq(whitelistSites.id, id));
  }

  async getUserWhitelistSites(userId: string): Promise<WhitelistSite[]> {
    return await db
      .select()
      .from(whitelistSites)
      .where(and(eq(whitelistSites.userId, userId), eq(whitelistSites.isActive, true)));
  }

  // Schedule operations
  async createBlockingSchedule(schedule: InsertBlockingSchedule): Promise<BlockingSchedule> {
    const [newSchedule] = await db
      .insert(blockingSchedules)
      .values(schedule)
      .returning();
    return newSchedule;
  }

  async updateBlockingSchedule(id: number, updates: Partial<InsertBlockingSchedule>): Promise<BlockingSchedule> {
    const [updatedSchedule] = await db
      .update(blockingSchedules)
      .set(updates)
      .where(eq(blockingSchedules.id, id))
      .returning();
    return updatedSchedule;
  }

  async getUserBlockingSchedules(userId: string): Promise<BlockingSchedule[]> {
    return await db
      .select()
      .from(blockingSchedules)
      .where(and(eq(blockingSchedules.userId, userId), eq(blockingSchedules.isActive, true)));
  }

  // Usage insights
  async createUsageInsight(insight: InsertUsageInsight): Promise<UsageInsight> {
    const [newInsight] = await db
      .insert(usageInsights)
      .values(insight)
      .returning();
    return newInsight;
  }

  async getUserUsageInsights(userId: string, startDate?: Date, endDate?: Date): Promise<UsageInsight[]> {
    let whereConditions = [eq(usageInsights.userId, userId)];

    if (startDate && endDate) {
      whereConditions.push(
        gte(usageInsights.date, startDate),
        lte(usageInsights.date, endDate)
      );
    }

    return await db
      .select()
      .from(usageInsights)
      .where(and(...whereConditions))
      .orderBy(desc(usageInsights.date));
  }

  // Nudges
  async createNudge(nudge: InsertNudge): Promise<Nudge> {
    const [newNudge] = await db
      .insert(nudges)
      .values(nudge)
      .returning();
    return newNudge;
  }

  async getUserNudges(userId: string): Promise<Nudge[]> {
    return await db
      .select()
      .from(nudges)
      .where(eq(nudges.userId, userId))
      .orderBy(desc(nudges.createdAt));
  }

  async markNudgeAsRead(id: number): Promise<void> {
    await db
      .update(nudges)
      .set({ isRead: true })
      .where(eq(nudges.id, id));
  }

  // Leaderboard
  async updateLeaderboardScore(userId: string, updates: Partial<InsertLeaderboardScore>): Promise<LeaderboardScore> {
    const [score] = await db
      .insert(leaderboardScores)
      .values({ userId, ...updates })
      .onConflictDoUpdate({
        target: leaderboardScores.userId,
        set: {
          ...updates,
          updatedAt: new Date(),
        },
      })
      .returning();
    return score;
  }

  async getLeaderboard(limit = 10): Promise<(LeaderboardScore & { user: User | null })[]> {
    return await db
      .select({
        id: leaderboardScores.id,
        userId: leaderboardScores.userId,
        weeklyScore: leaderboardScores.weeklyScore,
        monthlyScore: leaderboardScores.monthlyScore,
        totalScore: leaderboardScores.totalScore,
        streakDays: leaderboardScores.streakDays,
        lastActiveDate: leaderboardScores.lastActiveDate,
        updatedAt: leaderboardScores.updatedAt,
        user: users,
      })
      .from(leaderboardScores)
      .leftJoin(users, eq(leaderboardScores.userId, users.id))
      .orderBy(desc(leaderboardScores.totalScore))
      .limit(limit);
  }

  async getUserLeaderboardScore(userId: string): Promise<LeaderboardScore | undefined> {
    const [score] = await db
      .select()
      .from(leaderboardScores)
      .where(eq(leaderboardScores.userId, userId));
    return score;
  }
}

export const storage = new DatabaseStorage();