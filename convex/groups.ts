import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate unique invite code
function generateInviteCode(): string {
  return "FITBUDDY-" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Create a new group
export const createGroup = mutation({
  args: {
    name: v.string(),
    createdBy: v.id("users"),
    memberEmails: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let existingGroup = await ctx.db
      .query("groups")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
      .first();

    // Ensure invite code is unique
    while (existingGroup) {
      inviteCode = generateInviteCode();
      existingGroup = await ctx.db
        .query("groups")
        .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
        .first();
    }

    // Create group
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      inviteCode,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      groupStreak: 0,
      isArchived: false,
    });

    // Add creator as member
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: args.createdBy,
      joinedAt: Date.now(),
      isActive: true,
    });

    // Add other members if provided
    if (args.memberEmails && args.memberEmails.length > 0) {
      for (const email of args.memberEmails) {
        const user = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first();

        if (user) {
          await ctx.db.insert("groupMembers", {
            groupId,
            userId: user._id,
            joinedAt: Date.now(),
            isActive: true,
          });
        }
      }
    }

    return groupId;
  },
});

// Join group by invite code
export const joinGroup = mutation({
  args: {
    inviteCode: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Find group by invite code
    const group = await ctx.db
      .query("groups")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!group) {
      throw new Error("Group not found");
    }

    if (group.isArchived) {
      throw new Error("Group is archived");
    }

    // Check if user is already a member
    const existingMember = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", group._id).eq("userId", args.userId)
      )
      .first();

    if (existingMember) {
      // Reactivate if inactive
      if (!existingMember.isActive) {
        await ctx.db.patch(existingMember._id, { isActive: true });
      }
      return group._id;
    }

    // Check member count (max 4 members)
    const activeMembers = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", group._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (activeMembers.length >= 4) {
      throw new Error("Group is full (max 4 members)");
    }

    // Add user to group
    await ctx.db.insert("groupMembers", {
      groupId: group._id,
      userId: args.userId,
      joinedAt: Date.now(),
      isActive: true,
    });

    return group._id;
  },
});

// Get group by ID
export const getGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.groupId);
  },
});

// Get group by invite code
export const getGroupByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groups")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();
  },
});

// Get user's groups
export const getUserGroups = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (group && !group.isArchived) {
          return {
            ...group,
            membershipId: membership._id,
          };
        }
        return null;
      })
    );

    return groups.filter((g) => g !== null);
  },
});

// Get group members
export const getGroupMembers = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return user ? { ...user, membershipId: membership._id } : null;
      })
    );

    return members.filter((m) => m !== null);
  },
});

// Archive group
export const archiveGroup = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Only creator can archive
    if (group.createdBy !== args.userId) {
      throw new Error("Only group creator can archive the group");
    }

    await ctx.db.patch(args.groupId, {
      isArchived: true,
      archivedAt: Date.now(),
    });

    // Deactivate all memberships
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.patch(membership._id, { isActive: false });
    }

    return args.groupId;
  },
});

// Update group streak
export const updateGroupStreak = mutation({
  args: {
    groupId: v.id("groups"),
    streak: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.groupId, {
      groupStreak: args.streak,
    });
  },
});





