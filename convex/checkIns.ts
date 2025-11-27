import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";

// Create a check-in
export const createCheckIn = mutation({
	args: {
		userId: v.id("users"),
		groupId: v.optional(v.id("groups")),
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
				.filter((q: any) =>
					q.lt(q.field("timestamp"), yesterdayStart + 86400000)
				)
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

			// Update group streak only if groupId is provided
			if (args.groupId) {
				await updateGroupStreakHelper(ctx, args.groupId);
			}
		}

		return checkInId;
	},
});

// Helper function to update group streak
async function updateGroupStreakHelper(
	ctx: MutationCtx,
	groupId: Id<"groups">
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
			const groupDoc = group as Doc<"groups">;
			await ctx.db.patch(groupId, {
				groupStreak: groupDoc.groupStreak + 1,
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
		const checkIns = await ctx.db
			.query("checkIns")
			.withIndex("by_user", (q: any) => q.eq("userId", args.userId))
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

// Update a check-in
export const updateCheckIn = mutation({
	args: {
		checkInId: v.id("checkIns"),
		photo: v.optional(v.string()),
		note: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const checkIn = await ctx.db.get(args.checkInId);
		if (!checkIn) {
			throw new Error("Check-in not found");
		}
		if (checkIn.isArchived) {
			throw new Error("Cannot update archived check-in");
		}

		// Validate that the user owns this check-in
		// Note: In a production app, you'd get userId from auth context
		// For now, we'll allow updates but this should be secured with auth

		const updates: any = {};
		
		// Handle photo: convert empty string to undefined, keep null as undefined
		if (args.photo !== undefined) {
			updates.photo = args.photo === "" || args.photo === null ? undefined : args.photo;
		}
		
		// Handle note: convert empty string to undefined, keep null as undefined
		if (args.note !== undefined) {
			updates.note = args.note === "" || args.note === null ? undefined : args.note;
		}

		// Only update if there are actual changes
		if (Object.keys(updates).length === 0) {
			return; // No changes to make
		}

		await ctx.db.patch(args.checkInId, updates);
	},
});

// Helper function to recalculate user streak
async function recalculateUserStreak(ctx: MutationCtx, userId: Id<"users">) {
	const user = await ctx.db.get(userId);
	if (!user) return;

	// Get all non-archived check-ins for this user, ordered by timestamp
	const allCheckIns = await ctx.db
		.query("checkIns")
		.withIndex("by_user", (q: any) => q.eq("userId", userId))
		.filter((q: any) => q.neq(q.field("isArchived"), true))
		.order("desc")
		.collect();

	if (allCheckIns.length === 0) {
		await ctx.db.patch(userId, {
			currentStreak: 0,
			totalCheckIns: 0,
		});
		return;
	}

	// Calculate streak by checking consecutive days
	let streak = 0;
	let bestStreak = 0;
	let currentStreak = 0;
	const now = Date.now();
	const today = new Date(now);
	today.setHours(0, 0, 0, 0);
	
	// Group check-ins by day
	const checkInsByDay = new Map<number, boolean>();
	for (const checkIn of allCheckIns) {
		const checkInDate = new Date(checkIn.timestamp);
		checkInDate.setHours(0, 0, 0, 0);
		const dayKey = checkInDate.getTime();
		checkInsByDay.set(dayKey, true);
	}

	// Find current streak starting from today
	let checkDate = new Date(today);
	let consecutiveDays = 0;
	
	while (true) {
		const dayKey = checkDate.getTime();
		if (checkInsByDay.has(dayKey)) {
			consecutiveDays++;
			checkDate.setDate(checkDate.getDate() - 1);
		} else {
			break;
		}
	}

	currentStreak = consecutiveDays;

	// Calculate best streak
	const sortedDays = Array.from(checkInsByDay.keys()).sort((a, b) => b - a);
	let maxConsecutive = 0;
	let tempConsecutive = 0;
	let lastDay = -1;

	for (const day of sortedDays) {
		if (lastDay === -1 || day === lastDay - 86400000) {
			tempConsecutive++;
		} else {
			maxConsecutive = Math.max(maxConsecutive, tempConsecutive);
			tempConsecutive = 1;
		}
		lastDay = day;
	}
	bestStreak = Math.max(maxConsecutive, tempConsecutive, user.bestStreak);

	await ctx.db.patch(userId, {
		currentStreak: currentStreak,
		bestStreak: bestStreak,
		totalCheckIns: allCheckIns.length,
	});
}

// Archive a check-in and recalculate streaks
export const archiveCheckIn = mutation({
	args: {
		checkInId: v.id("checkIns"),
	},
	handler: async (ctx, args) => {
		const checkIn = await ctx.db.get(args.checkInId);
		if (!checkIn) {
			throw new Error("Check-in not found");
		}

		await ctx.db.patch(args.checkInId, {
			isArchived: true,
			archivedAt: Date.now(),
		});

		// Recalculate user streak
		await recalculateUserStreak(ctx, checkIn.userId);

		// Recalculate group streak if applicable
		if (checkIn.groupId) {
			await recalculateGroupStreak(ctx, checkIn.groupId);
		}
	},
});

// Helper function to recalculate group streak
async function recalculateGroupStreak(ctx: MutationCtx, groupId: Id<"groups">) {
	const memberships = await ctx.db
		.query("groupMembers")
		.withIndex("by_group", (q: any) => q.eq("groupId", groupId))
		.filter((q: any) => q.eq(q.field("isActive"), true))
		.collect();

	if (memberships.length === 0) return;

	const group = await ctx.db.get(groupId);
	if (!group) return;

	// Get all check-ins for all members
	const allMemberCheckIns = new Map<string, number[]>();
	
	for (const membership of memberships) {
		const checkIns = await ctx.db
			.query("checkIns")
			.withIndex("by_user", (q: any) => q.eq("userId", membership.userId))
			.filter((q: any) => q.eq(q.field("groupId"), groupId))
			.filter((q: any) => q.neq(q.field("isArchived"), true))
			.collect();
		
		const dayKeys = checkIns.map(ci => {
			const date = new Date(ci.timestamp);
			date.setHours(0, 0, 0, 0);
			return date.getTime();
		});
		
		allMemberCheckIns.set(membership.userId, dayKeys);
	}

	// Find days where all members checked in
	const allDays = new Set<number>();
	for (const dayKeys of allMemberCheckIns.values()) {
		for (const day of dayKeys) {
			allDays.add(day);
		}
	}

	let groupStreak = 0;
	const sortedDays = Array.from(allDays).sort((a, b) => b - a);
	
	for (const day of sortedDays) {
		let allCheckedIn = true;
		for (const dayKeys of allMemberCheckIns.values()) {
			if (!dayKeys.includes(day)) {
				allCheckedIn = false;
				break;
			}
		}
		
		if (allCheckedIn) {
			groupStreak++;
		} else {
			break;
		}
	}

	await ctx.db.patch(groupId, {
		groupStreak: groupStreak,
	});
}

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
