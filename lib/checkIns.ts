import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Hook for check-in operations (mutations only)
// Using TanStack Query mutations for better integration
export function useCheckIns() {
	const createCheckInMutationFn = useConvexMutation(api.checkIns.createCheckIn);
	const updateCheckInMutationFn = useConvexMutation(api.checkIns.updateCheckIn);
	const archiveCheckInMutationFn = useConvexMutation(
		api.checkIns.archiveCheckIn
	);
	const archiveCheckInsMutationFn = useConvexMutation(
		api.checkIns.archiveCheckIns
	);

	const createCheckInMutation = useMutation({
		mutationFn: createCheckInMutationFn,
	});

	const updateCheckInMutation = useMutation({
		mutationFn: updateCheckInMutationFn,
	});

	const archiveCheckInMutation = useMutation({
		mutationFn: archiveCheckInMutationFn,
	});

	const archiveCheckInsMutation = useMutation({
		mutationFn: archiveCheckInsMutationFn,
	});

	// Convenience async functions for backward compatibility
	const createCheckIn = async (
		args: Parameters<typeof createCheckInMutationFn>[0]
	) => {
		return createCheckInMutation.mutateAsync(args);
	};

	const updateCheckIn = async (
		args: Parameters<typeof updateCheckInMutationFn>[0]
	) => {
		return updateCheckInMutation.mutateAsync(args);
	};

	const archiveCheckIn = async (
		args: Parameters<typeof archiveCheckInMutationFn>[0]
	) => {
		return archiveCheckInMutation.mutateAsync(args);
	};

	const archiveCheckIns = async (
		args: Parameters<typeof archiveCheckInsMutationFn>[0]
	) => {
		return archiveCheckInsMutation.mutateAsync(args);
	};

	return {
		// TanStack Query mutation objects (for advanced usage)
		createCheckInMutation,
		updateCheckInMutation,
		archiveCheckInMutation,
		archiveCheckInsMutation,
		// Convenience async functions (for backward compatibility)
		createCheckIn,
		updateCheckIn,
		archiveCheckIn,
		archiveCheckIns,
	};
}

// Hook to get check-ins for a group
export function useGroupCheckIns(groupId: Id<"groups"> | null, limit?: number) {
	const {
		data: checkIns,
		isPending,
		error,
	} = useQuery({
		...convexQuery(api.checkIns.getGroupCheckIns, { groupId: groupId!, limit }),
		enabled: !!groupId,
	});

	if (!groupId) return undefined;
	if (isPending) return undefined;
	if (error) {
		console.error("Error fetching group check-ins:", error);
		return undefined;
	}
	return checkIns;
}

// Hook to get user's check-ins
export function useUserCheckIns(userId: Id<"users"> | null, limit?: number) {
	const {
		data: checkIns,
		isPending,
		error,
	} = useQuery({
		...convexQuery(api.checkIns.getUserCheckIns, { userId: userId!, limit }),
		enabled: !!userId,
	});

	if (!userId) return undefined;
	if (isPending) return undefined;
	if (error) {
		console.error("Error fetching user check-ins:", error);
		return undefined;
	}
	return checkIns;
}

// Hook to check if user checked in today
export function useHasCheckedInToday(userId: Id<"users"> | null) {
	const {
		data: hasCheckedIn,
		isPending,
		error,
	} = useQuery({
		...convexQuery(api.checkIns.hasCheckedInToday, { userId: userId! }),
		enabled: !!userId,
	});

	if (!userId) return undefined;
	if (isPending) return undefined;
	if (error) {
		console.error("Error checking if user checked in today:", error);
		return undefined;
	}
	return hasCheckedIn;
}

// Hook to get check-ins by date range
export function useCheckInsByDateRange(
	userId: Id<"users"> | null,
	groupId: Id<"groups"> | null,
	startDate: number,
	endDate: number
) {
	const {
		data: checkIns,
		isPending,
		error,
	} = useQuery(
		convexQuery(api.checkIns.getCheckInsByDateRange, {
			userId: userId || undefined,
			groupId: groupId || undefined,
			startDate,
			endDate,
		})
	);

	if (isPending) return undefined;
	if (error) {
		console.error("Error fetching check-ins by date range:", error);
		return undefined;
	}
	return checkIns;
}

// Hook to get user stats
export function useUserStats(userId: Id<"users"> | null) {
	const {
		data: stats,
		isPending,
		error,
	} = useQuery({
		...convexQuery(api.users.getUserStats, { userId: userId! }),
		enabled: !!userId,
	});

	if (!userId) return undefined;
	if (isPending) return undefined;
	if (error) {
		console.error("Error fetching user stats:", error);
		return undefined;
	}
	return stats;
}
