import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or get user by email
export const getOrCreateUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      avatar: args.avatar,
      createdAt: Date.now(),
      currentStreak: 0,
      bestStreak: 0,
      totalCheckIns: 0,
    });

    return userId;
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Update user profile
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
    return await ctx.db.get(userId);
  },
});

// Update user stats
export const updateUserStats = mutation({
  args: {
    userId: v.id("users"),
    currentStreak: v.optional(v.number()),
    bestStreak: v.optional(v.number()),
    totalCheckIns: v.optional(v.number()),
    lastCheckIn: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
    return await ctx.db.get(userId);
  },
});

// Get user stats
export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      currentStreak: user.currentStreak,
      bestStreak: user.bestStreak,
      totalCheckIns: user.totalCheckIns,
      lastCheckIn: user.lastCheckIn,
    };
  },
});

// Migrate user data from anonymous user to new user
// This is called when an anonymous user signs in with a real account
export const migrateAnonymousUserData = mutation({
  args: {
    anonymousEmail: v.string(),
    newEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Find anonymous user by email
    const anonymousUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.anonymousEmail))
      .first();

    if (!anonymousUser) {
      // No anonymous user found, nothing to migrate
      return null;
    }

    // Find or create new user by email
    let newUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.newEmail))
      .first();

    if (!newUser) {
      // Create new user with anonymous user's stats
      const newUserId = await ctx.db.insert("users", {
        name: anonymousUser.name,
        email: args.newEmail,
        avatar: anonymousUser.avatar,
        createdAt: anonymousUser.createdAt, // Keep original creation date
        currentStreak: anonymousUser.currentStreak,
        bestStreak: anonymousUser.bestStreak,
        totalCheckIns: anonymousUser.totalCheckIns,
        lastCheckIn: anonymousUser.lastCheckIn,
      });
      newUser = await ctx.db.get(newUserId);
      if (!newUser) {
        throw new Error("Failed to create new user");
      }
    } else {
      // Merge stats - keep the best values
      await ctx.db.patch(newUser._id, {
        currentStreak: Math.max(newUser.currentStreak, anonymousUser.currentStreak),
        bestStreak: Math.max(newUser.bestStreak, anonymousUser.bestStreak),
        totalCheckIns: newUser.totalCheckIns + anonymousUser.totalCheckIns,
        lastCheckIn: anonymousUser.lastCheckIn || newUser.lastCheckIn,
      });
      const updatedUser = await ctx.db.get(newUser._id);
      if (!updatedUser) {
        throw new Error("Failed to update user");
      }
      newUser = updatedUser;
    }

    // Migrate group memberships
    const anonymousMemberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", anonymousUser._id))
      .collect();

    for (const membership of anonymousMemberships) {
      // Check if new user is already a member of this group
      const existingMembership = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_and_user", (q) =>
          q.eq("groupId", membership.groupId).eq("userId", newUser._id)
        )
        .first();

      if (!existingMembership) {
        // Transfer membership to new user
        await ctx.db.patch(membership._id, {
          userId: newUser._id,
        });
      } else {
        // New user already a member, remove anonymous membership
        await ctx.db.delete(membership._id);
      }
    }

    // Migrate check-ins
    const anonymousCheckIns = await ctx.db
      .query("checkIns")
      .withIndex("by_user", (q) => q.eq("userId", anonymousUser._id))
      .collect();

    for (const checkIn of anonymousCheckIns) {
      await ctx.db.patch(checkIn._id, {
        userId: newUser._id,
      });
    }

    // Update groups created by anonymous user
    const anonymousGroups = await ctx.db
      .query("groups")
      .withIndex("by_creator", (q) => q.eq("createdBy", anonymousUser._id))
      .collect();

    for (const group of anonymousGroups) {
      await ctx.db.patch(group._id, {
        createdBy: newUser._id,
      });
    }

    // Delete anonymous user
    await ctx.db.delete(anonymousUser._id);

    return newUser._id;
  },
});





