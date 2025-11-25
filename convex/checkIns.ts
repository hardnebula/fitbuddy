import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

// Create a check-in
export const createCheckIn = mutation({
  args: {
    userId: v.id("users"),
    groupId: v.id("groups"),
    photo: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    // Check if user already checked in today
    const existingCheckIn = await ctx.db
      .query("checkIns")
      .withIndex("by_user_and_date", (q: any) =>
        q.eq("userId", args.userId).gte("timestamp", todayStart)
      )
      .filter((q: any) => q.lt(q.field("timestamp"), todayStart + 86400000))
      .first();

    if (existingCheckIn && !existingCheckIn.isArchived) {
      throw new Error("Already checked in today");
    }

    // Create check-in
    const checkInId = await ctx.db.insert("checkIns", {
      userId: args.userId,
      groupId: args.groupId,
      timestamp: now,
      photo: args.photo,
      note: args.note,
      isArchived: false,
    });

    // Update user stats
    const user = await ctx.db.get(args.userId);
    if (user) {
      const yesterday = new Date(now - 86400000);
      yesterday.setHours(0, 0, 0, 0);
      const yesterdayStart = yesterday.getTime();

      // Check if user checked in yesterday
      const yesterdayCheckIn = await ctx.db
        .query("checkIns")
        .withIndex("by_user_and_date", (q: any) =>
          q.eq("userId", args.userId).gte("timestamp", yesterdayStart)
        )
        .filter((q: any) => q.lt(q.field("timestamp"), yesterdayStart + 86400000))
        .filter((q: any) => q.neq(q.field("isArchived"), true))
        .first();

      let newStreak = 1;
      if (yesterdayCheckIn) {
        newStreak = user.currentStreak + 1;
      }

      const newBestStreak = Math.max(newStreak, user.bestStreak);

      await ctx.db.patch(args.userId, {
        currentStreak: newStreak,
        bestStreak: newBestStreak,
        totalCheckIns: user.totalCheckIns + 1,
        lastCheckIn: now,
      });

      // Update group streak
      await updateGroupStreakHelper(ctx, args.groupId);
    }

    return checkInId;
  },
});

// Helper function to update group streak
async function updateGroupStreakHelper(
  ctx: MutationCtx,
  groupId: any
) {
  const memberships = await ctx.db
    .query("groupMembers")
    .withIndex("by_group", (q: any) => q.eq("groupId", groupId))
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .collect();

  if (memberships.length === 0) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();

  // Check if all members checked in today
  let allCheckedIn = true;
  for (const membership of memberships) {
    const checkIn = await ctx.db
      .query("checkIns")
      .withIndex("by_user_and_date", (q: any) =>
        q.eq("userId", membership.userId).gte("timestamp", todayStart)
      )
      .filter((q: any) => q.lt(q.field("timestamp"), todayStart + 86400000))
      .filter((q: any) => q.neq(q.field("isArchived"), true))
      .first();

    if (!checkIn) {
      allCheckedIn = false;
      break;
    }
  }

  if (allCheckedIn) {
    const group = await ctx.db.get(groupId);
    if (group) {
      await ctx.db.patch(groupId, {
        groupStreak: group.groupStreak + 1,
      });
    }
  }
}

// Get check-ins for a group
export const getGroupCheckIns = query({
  args: {
    groupId: v.id("groups"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const checkIns = await ctx.db
      .query("checkIns")
      .withIndex("by_group_and_date", (q: any) => q.eq("groupId", args.groupId))
      .filter((q: any) => q.neq(q.field("isArchived"), true))
      .order("desc")
      .take(limit);

    const checkInsWithUsers = await Promise.all(
      checkIns.map(async (checkIn) => {
        const user = await ctx.db.get(checkIn.userId);
        return {
          ...checkIn,
          userName: user?.name || "Unknown",
          userAvatar: user?.avatar,
        };
      })
    );

    return checkInsWithUsers;
  },
});

// Get user's check-ins
export const getUserCheckIns = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    return await ctx.db
      .query("checkIns")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .filter((q: any) => q.neq(q.field("isArchived"), true))
      .order("desc")
      .take(limit);
  },
});

// Get check-ins for a specific date range
export const getCheckInsByDateRange = query({
  args: {
    userId: v.optional(v.id("users")),
    groupId: v.optional(v.id("groups")),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    let checkIns;

    if (args.userId) {
      checkIns = await ctx.db
        .query("checkIns")
        .withIndex("by_user_and_date", (q: any) =>
          q.eq("userId", args.userId!).gte("timestamp", args.startDate)
        )
        .filter((q: any) => q.lte(q.field("timestamp"), args.endDate))
        .filter((q: any) => q.neq(q.field("isArchived"), true))
        .order("desc")
        .collect();
    } else if (args.groupId) {
      checkIns = await ctx.db
        .query("checkIns")
        .withIndex("by_group_and_date", (q: any) =>
          q.eq("groupId", args.groupId!).gte("timestamp", args.startDate)
        )
        .filter((q: any) => q.lte(q.field("timestamp"), args.endDate))
        .filter((q: any) => q.neq(q.field("isArchived"), true))
        .order("desc")
        .collect();
    } else {
      checkIns = await ctx.db
        .query("checkIns")
        .withIndex("by_timestamp", (q: any) =>
          q.gte("timestamp", args.startDate)
        )
        .filter((q: any) => q.lte(q.field("timestamp"), args.endDate))
        .filter((q: any) => q.neq(q.field("isArchived"), true))
        .order("desc")
        .collect();
    }

    const checkInsWithUsers = await Promise.all(
      checkIns.map(async (checkIn) => {
        const user = await ctx.db.get(checkIn.userId);
        return {
          ...checkIn,
          userName: user?.name || "Unknown",
          userAvatar: user?.avatar,
        };
      })
    );

    return checkInsWithUsers;
  },
});

// Check if user checked in today
export const hasCheckedInToday = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const checkIn = await ctx.db
      .query("checkIns")
      .withIndex("by_user_and_date", (q: any) =>
        q.eq("userId", args.userId).gte("timestamp", todayStart)
      )
      .filter((q: any) => q.lt(q.field("timestamp"), todayStart + 86400000))
      .filter((q: any) => q.neq(q.field("isArchived"), true))
      .first();

    return checkIn !== null;
  },
});

// Archive a check-in
export const archiveCheckIn = mutation({
  args: {
    checkInId: v.id("checkIns"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.checkInId, {
      isArchived: true,
      archivedAt: Date.now(),
    });
  },
});

// Archive multiple check-ins
export const archiveCheckIns = mutation({
  args: {
    checkInIds: v.array(v.id("checkIns")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const checkInId of args.checkInIds) {
      await ctx.db.patch(checkInId, {
        isArchived: true,
        archivedAt: now,
      });
    }
  },
});

