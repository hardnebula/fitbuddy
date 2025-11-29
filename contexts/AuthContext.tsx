import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Id, Doc } from "../convex/_generated/dataModel";
import { useAuth, useCurrentUser } from "../lib/auth";
import {
	getUnsyncedCheckIns,
	markCheckInsAsSynced,
} from "../lib/localCheckIns";
import { useCheckIns } from "../lib/checkIns";
import { authClient } from "../lib/auth-client";

interface AuthContextType {
	userId: Id<"users"> | null;
	user: Doc<"users"> | null | undefined;
	login: (email: string, name: string, avatar?: string) => Promise<void>;
	logout: () => Promise<void>;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_ID_KEY = "@teo:userId";

export function AuthProvider({ children }: { children: ReactNode }) {
	const [userId, setUserId] = useState<Id<"users"> | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { login: loginMutation } = useAuth();
	const user = useCurrentUser(userId);
	const { createCheckIn } = useCheckIns();

	// Load stored user ID on mount and sync with Better Auth session
	useEffect(() => {
		loadStoredUserId();
	}, []);

	const loadStoredUserId = async () => {
		try {
			// Check Better Auth session first
			const session = await authClient.getSession();

			if (session?.data?.user) {
				const betterAuthUser = session.data.user;
				// Get or create Convex user based on Better Auth user email
				const convexUserId = await loginMutation(
					betterAuthUser.email,
					betterAuthUser.name || "User",
					undefined // Better Auth user object doesn't have image property directly
				);
				await AsyncStorage.setItem(USER_ID_KEY, convexUserId);
				setUserId(convexUserId);
			} else {
				// No Better Auth session, check stored userId
				const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
				if (storedUserId) {
					setUserId(storedUserId as Id<"users">);
				}
			}
		} catch (error) {
			console.error("Error loading stored user ID:", error);
			// Fallback to stored userId if Better Auth check fails
			try {
				const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
				if (storedUserId) {
					setUserId(storedUserId as Id<"users">);
				}
			} catch (fallbackError) {
				console.error("Error loading fallback user ID:", fallbackError);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (email: string, name: string, avatar?: string) => {
		try {
			const newUserId = await loginMutation(email, name, avatar);
			await AsyncStorage.setItem(USER_ID_KEY, newUserId);
			setUserId(newUserId);

			// Sync local check-ins to server
			await syncLocalCheckIns(newUserId);
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	};

	const syncLocalCheckIns = async (syncedUserId: Id<"users">) => {
		try {
			const unsyncedCheckIns = await getUnsyncedCheckIns();
			if (unsyncedCheckIns.length === 0) return;

			// Sync each local check-in to server
			const syncedIds: string[] = [];
			for (const localCheckIn of unsyncedCheckIns) {
				try {
					await createCheckIn({
						userId: syncedUserId,
						groupId: localCheckIn.groupId || undefined,
						note: localCheckIn.note || undefined,
						photo: localCheckIn.photo || undefined,
					});
					syncedIds.push(localCheckIn.id);
				} catch (error) {
					console.error("Error syncing check-in:", error);
					// Continue with other check-ins even if one fails
				}
			}

			// Mark synced check-ins
			if (syncedIds.length > 0) {
				await markCheckInsAsSynced(syncedIds);
			}
		} catch (error) {
			console.error("Error syncing local check-ins:", error);
			// Don't throw - login should succeed even if sync fails
		}
	};

	const logout = async () => {
		try {
			// Sign out from Better Auth
			await authClient.signOut();
			// Clear stored Convex userId
			await AsyncStorage.removeItem(USER_ID_KEY);
			setUserId(null);
		} catch (error) {
			console.error("Logout error:", error);
			// Still clear local state even if Better Auth sign out fails
			await AsyncStorage.removeItem(USER_ID_KEY);
			setUserId(null);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				userId,
				user,
				login,
				logout,
				isLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
}
