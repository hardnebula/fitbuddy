import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Hook for group operations (mutations only)
export function useGroups() {
	const createGroupMutationFn = useConvexMutation(api.groups.createGroup);
	const joinGroupMutationFn = useConvexMutation(api.groups.joinGroup);
	const archiveGroupMutationFn = useConvexMutation(api.groups.archiveGroup);

	const createGroupMutation = useMutation({
		mutationFn: createGroupMutationFn,
	});

	const joinGroupMutation = useMutation({
		mutationFn: joinGroupMutationFn,
	});

	const archiveGroupMutation = useMutation({
		mutationFn: archiveGroupMutationFn,
	});

	// Convenience async functions for backward compatibility
	const createGroup = async (
		args: Parameters<typeof createGroupMutationFn>[0]
	) => {
		return createGroupMutation.mutateAsync(args);
	};

	const joinGroup = async (args: Parameters<typeof joinGroupMutationFn>[0]) => {
		return joinGroupMutation.mutateAsync(args);
	};

	const archiveGroup = async (
		args: Parameters<typeof archiveGroupMutationFn>[0]
	) => {
		return archiveGroupMutation.mutateAsync(args);
	};

	return {
		// TanStack Query mutation objects (for advanced usage)
		createGroupMutation,
		joinGroupMutation,
		archiveGroupMutation,
		// Convenience async functions (for backward compatibility)
		createGroup,
		joinGroup,
		archiveGroup,
	};
}

// Hook to get user's groups
export function useUserGroups(userId: Id<"users"> | null) {
	const {
		data: groups,
		isPending,
		error,
	} = useQuery({
		...convexQuery(api.groups.getUserGroups, { userId: userId! }),
		enabled: !!userId,
	});

	if (!userId) return undefined;
	if (isPending) return undefined;
	if (error) {
		console.error("Error fetching user groups:", error);
		return undefined;
	}
	return groups;
}

// Hook to get a specific group
export function useGroup(groupId: Id<"groups"> | null) {
	const {
		data: group,
		isPending,
		error,
	} = useQuery({
		...convexQuery(api.groups.getGroup, { groupId: groupId! }),
		enabled: !!groupId,
	});

	if (!groupId) return undefined;
	if (isPending) return undefined;
	if (error) {
		console.error("Error fetching group:", error);
		return undefined;
	}
	return group;
}

// Hook to get group members
export function useGroupMembers(groupId: Id<"groups"> | null) {
	const {
		data: members,
		isPending,
		error,
	} = useQuery({
		...convexQuery(api.groups.getGroupMembers, { groupId: groupId! }),
		enabled: !!groupId,
	});

	if (!groupId) return undefined;
	if (isPending) return undefined;
	if (error) {
		console.error("Error fetching group members:", error);
		return undefined;
	}
	return members;
}

// Hook to get group by invite code
export function useGroupByInviteCode(inviteCode: string | null) {
	const {
		data: group,
		isPending,
		error,
	} = useQuery({
		...convexQuery(api.groups.getGroupByInviteCode, {
			inviteCode: inviteCode!,
		}),
		enabled: !!inviteCode,
	});

	if (!inviteCode) return undefined;
	if (isPending) return undefined;
	if (error) {
		console.error("Error fetching group by invite code:", error);
		return undefined;
	}
	return group;
}
