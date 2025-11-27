import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
    lastCheckIn: v.optional(v.number()),
    currentStreak: v.number(),
    bestStreak: v.number(),
    totalCheckIns: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_streak", ["currentStreak"]),

  // Groups table
  groups: defineTable({
    name: v.string(),
    inviteCode: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    groupStreak: v.number(),
    isArchived: v.optional(v.boolean()),
    archivedAt: v.optional(v.number()),
  })
    .index("by_invite_code", ["inviteCode"])
    .index("by_creator", ["createdBy"])
    .index("by_archived", ["isArchived"]),

  // Group members (many-to-many relationship)
  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    joinedAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_and_user", ["groupId", "userId"]),

  // Check-ins table
  checkIns: defineTable({
    userId: v.id("users"),
    groupId: v.optional(v.id("groups")),
    timestamp: v.number(),
    photo: v.optional(v.string()),
    note: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
    archivedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_group", ["groupId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_and_date", ["userId", "timestamp"])
    .index("by_group_and_date", ["groupId", "timestamp"])
    .index("by_archived", ["isArchived"]),
});





