import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Hook for user authentication
export function useAuth() {
	const getOrCreateUserMutationFn = useConvexMutation(api.users.getOrCreateUser);

	const getOrCreateUserMutation = useMutation({
		mutationFn: getOrCreateUserMutationFn,
	});

	// Convenience async function for backward compatibility
	const login = async (email: string, name: string, avatar?: string) => {
		try {
			const userId = await getOrCreateUserMutation.mutateAsync({
				email,
				name,
				avatar,
			});
			return userId;
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	};

	return {
		// TanStack Query mutation object (for advanced usage)
		getOrCreateUserMutation,
		// Convenience async function (for backward compatibility)
		login,
	};
}

// Hook to get user by email
export function useUserByEmail(email: string | null) {
	const { data: user, isPending, error } = useQuery({
		...convexQuery(api.users.getUserByEmail, { email: email! }),
		enabled: !!email,
	});

	if (!email) return undefined;
	if (isPending) return undefined;
	if (error) {
		console.error("Error fetching user by email:", error);
		return undefined;
	}
	return user;
}

// Hook to get current user
export function useCurrentUser(userId: Id<'users'> | null) {
	const { data: user, isPending, error } = useQuery({
		...convexQuery(api.users.getUser, { userId: userId! }),
		enabled: !!userId,
	});

	if (!userId) return undefined;
	if (isPending) return undefined;
	if (error) {
		console.error("Error fetching current user:", error);
		return undefined;
	}
	return user;
}

