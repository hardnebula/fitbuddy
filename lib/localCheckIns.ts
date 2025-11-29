import AsyncStorage from "@react-native-async-storage/async-storage";
import { Id } from "@/convex/_generated/dataModel";

const LOCAL_CHECKINS_KEY = "@teo:local_checkins";
const LOCAL_USER_STATS_KEY = "@teo:local_user_stats";

export interface LocalCheckIn {
	id: string; // temporary local ID
	userId: null; // null for anonymous check-ins
	groupId?: Id<"groups"> | null;
	timestamp: number;
	photo?: string | null;
	note?: string | null;
	isSynced: boolean; // whether it's been synced to server
}

export interface LocalUserStats {
	currentStreak: number;
	bestStreak: number;
	totalCheckIns: number;
	lastCheckIn?: number;
}

/**
 * Get all local check-ins
 */
export async function getLocalCheckIns(): Promise<LocalCheckIn[]> {
	try {
		const data = await AsyncStorage.getItem(LOCAL_CHECKINS_KEY);
		if (data) {
			return JSON.parse(data) as LocalCheckIn[];
		}
		return [];
	} catch (error) {
		console.error("Error getting local check-ins:", error);
		return [];
	}
}

/**
 * Save a local check-in
 */
export async function saveLocalCheckIn(
	checkIn: Omit<LocalCheckIn, "id" | "isSynced">
): Promise<LocalCheckIn> {
	try {
		const existing = await getLocalCheckIns();
		const newCheckIn: LocalCheckIn = {
			...checkIn,
			id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			isSynced: false,
		};
		existing.push(newCheckIn);
		await AsyncStorage.setItem(LOCAL_CHECKINS_KEY, JSON.stringify(existing));

		// Update local stats
		await updateLocalStats();

		return newCheckIn;
	} catch (error) {
		console.error("Error saving local check-in:", error);
		throw error;
	}
}

/**
 * Update local user stats based on check-ins
 * Recalculates streaks from scratch, similar to server-side logic
 */
export async function updateLocalStats(): Promise<void> {
	try {
		const checkIns = await getLocalCheckIns();
		const stats = await getLocalUserStats();

		// Get all unsynced check-ins (these are the ones we manage locally)
		const unsyncedCheckIns = checkIns
			.filter((ci) => !ci.isSynced)
			.sort((a, b) => b.timestamp - a.timestamp); // Sort descending

		if (unsyncedCheckIns.length === 0) {
			// Reset stats if no check-ins
			await saveLocalUserStats({
				currentStreak: 0,
				bestStreak: stats.bestStreak, // Keep best streak as historical record
				totalCheckIns: 0,
			});
			return;
		}

		// Group check-ins by day (similar to server logic)
		const checkInsByDay = new Map<number, boolean>();
		for (const checkIn of unsyncedCheckIns) {
			const checkInDate = new Date(checkIn.timestamp);
			checkInDate.setHours(0, 0, 0, 0);
			const dayKey = checkInDate.getTime();
			checkInsByDay.set(dayKey, true);
		}

		// Calculate current streak starting from today
		const now = Date.now();
		const today = new Date(now);
		today.setHours(0, 0, 0, 0);
		const todayKey = today.getTime();

		let currentStreak = 0;
		let checkDate = new Date(today);

		// Count consecutive days starting from today going backwards
		while (true) {
			const dayKey = checkDate.getTime();
			if (checkInsByDay.has(dayKey)) {
				currentStreak++;
				checkDate.setDate(checkDate.getDate() - 1);
			} else {
				break;
			}
		}

		// Calculate best streak from all days
		const sortedDays = Array.from(checkInsByDay.keys()).sort((a, b) => b - a);
		let bestStreak = 0;
		let tempConsecutive = 0;
		let lastDay = -1;

		for (const day of sortedDays) {
			if (lastDay === -1 || day === lastDay - 86400000) {
				// Consecutive day
				tempConsecutive++;
			} else {
				// Gap found, reset
				bestStreak = Math.max(bestStreak, tempConsecutive);
				tempConsecutive = 1;
			}
			lastDay = day;
		}
		bestStreak = Math.max(bestStreak, tempConsecutive, stats.bestStreak);

		const lastCheckIn = unsyncedCheckIns[0]?.timestamp;

		await saveLocalUserStats({
			currentStreak,
			bestStreak,
			totalCheckIns: unsyncedCheckIns.length,
			lastCheckIn,
		});
	} catch (error) {
		console.error("Error updating local stats:", error);
	}
}

/**
 * Get local user stats
 */
export async function getLocalUserStats(): Promise<LocalUserStats> {
	try {
		const data = await AsyncStorage.getItem(LOCAL_USER_STATS_KEY);
		if (data) {
			return JSON.parse(data) as LocalUserStats;
		}
		return {
			currentStreak: 0,
			bestStreak: 0,
			totalCheckIns: 0,
		};
	} catch (error) {
		console.error("Error getting local user stats:", error);
		return {
			currentStreak: 0,
			bestStreak: 0,
			totalCheckIns: 0,
		};
	}
}

/**
 * Save local user stats
 */
export async function saveLocalUserStats(stats: LocalUserStats): Promise<void> {
	try {
		await AsyncStorage.setItem(LOCAL_USER_STATS_KEY, JSON.stringify(stats));
	} catch (error) {
		console.error("Error saving local user stats:", error);
		throw error;
	}
}

/**
 * Check if user has checked in today (local)
 */
export async function hasCheckedInTodayLocal(): Promise<boolean> {
	try {
		const checkIns = await getLocalCheckIns();
		const now = Date.now();
		const today = new Date(now);
		today.setHours(0, 0, 0, 0);
		const todayStart = today.getTime();

		return checkIns.some(
			(ci) =>
				ci.timestamp >= todayStart &&
				ci.timestamp < todayStart + 86400000 &&
				!ci.isSynced
		);
	} catch (error) {
		console.error("Error checking local check-in today:", error);
		return false;
	}
}

/**
 * Mark local check-ins as synced
 */
export async function markCheckInsAsSynced(
	checkInIds: string[]
): Promise<void> {
	try {
		const checkIns = await getLocalCheckIns();
		const updated = checkIns.map((ci) =>
			checkInIds.includes(ci.id) ? { ...ci, isSynced: true } : ci
		);
		await AsyncStorage.setItem(LOCAL_CHECKINS_KEY, JSON.stringify(updated));
	} catch (error) {
		console.error("Error marking check-ins as synced:", error);
		throw error;
	}
}

/**
 * Get unsynced check-ins
 */
export async function getUnsyncedCheckIns(): Promise<LocalCheckIn[]> {
	try {
		const checkIns = await getLocalCheckIns();
		return checkIns.filter((ci) => !ci.isSynced);
	} catch (error) {
		console.error("Error getting unsynced check-ins:", error);
		return [];
	}
}

/**
 * Update a local check-in by ID
 */
export async function updateLocalCheckIn(
	checkInId: string,
	updates: {
		photo?: string | null;
		note?: string | null;
	}
): Promise<void> {
	try {
		const checkIns = await getLocalCheckIns();

		// Check if check-in exists
		const checkInExists = checkIns.some((ci) => ci.id === checkInId);
		if (!checkInExists) {
			throw new Error("Check-in not found");
		}

		const updated = checkIns.map((ci) =>
			ci.id === checkInId
				? {
						...ci,
						photo: updates.photo !== undefined ? updates.photo : ci.photo,
						note: updates.note !== undefined ? updates.note : ci.note,
						// Reset isSynced to false if check-in was edited, so it can be resynced
						isSynced: false,
					}
				: ci
		);

		await AsyncStorage.setItem(LOCAL_CHECKINS_KEY, JSON.stringify(updated));

		// Update local stats after update
		await updateLocalStats();
	} catch (error) {
		console.error("Error updating local check-in:", error);
		throw error;
	}
}

/**
 * Delete a local check-in by ID
 */
export async function deleteLocalCheckIn(checkInId: string): Promise<void> {
	try {
		const checkIns = await getLocalCheckIns();
		const filtered = checkIns.filter((ci) => ci.id !== checkInId);
		await AsyncStorage.setItem(LOCAL_CHECKINS_KEY, JSON.stringify(filtered));

		// Update local stats after deletion
		await updateLocalStats();
	} catch (error) {
		console.error("Error deleting local check-in:", error);
		throw error;
	}
}

/**
 * Clear all local check-ins (after successful sync)
 */
export async function clearLocalCheckIns(): Promise<void> {
	try {
		await AsyncStorage.removeItem(LOCAL_CHECKINS_KEY);
		await AsyncStorage.removeItem(LOCAL_USER_STATS_KEY);
	} catch (error) {
		console.error("Error clearing local check-ins:", error);
		throw error;
	}
}
