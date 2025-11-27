import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { LoadingSpinner } from "../components";
import { Theme } from "../constants/Theme";
import { isOnboardingComplete } from "../lib/onboarding";
import { useAuthContext } from "../contexts/AuthContext";

export default function Index() {
	const router = useRouter();
	const { userId, isLoading: authLoading } = useAuthContext();
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		checkInitialRoute();
	}, [authLoading, userId]);

	const checkInitialRoute = async () => {
		try {
			// Wait for auth to finish loading
			if (authLoading) {
				return;
			}

			const onboardingComplete = await isOnboardingComplete();

			if (!onboardingComplete) {
				// User hasn't completed onboarding, send to welcome screen
				router.replace("/(auth)/welcome");
				return;
			}

			// Onboarding is complete, go to home (auth will be handled later)
			router.replace("/(tabs)/home");
		} catch (error) {
			// Fallback to welcome screen on error
			router.replace("/(auth)/welcome");
		} finally {
			setIsChecking(false);
		}
	};

	// Show loading spinner while checking onboarding and auth status
	if (isChecking || authLoading) {
		return (
			<>
				<Stack.Screen
					options={{
						headerShown: false,
						animation: "none",
					}}
				/>
				<View style={styles.container}>
					<LoadingSpinner />
				</View>
			</>
		);
	}

	return null;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Theme.colors.background,
	},
});
