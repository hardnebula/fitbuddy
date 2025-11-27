import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "../lib/auth-client";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import Constants from "expo-constants";

// Get Convex URL from environment variables
const getConvexUrl = () => {
	if (process.env.EXPO_PUBLIC_CONVEX_URL) {
		return process.env.EXPO_PUBLIC_CONVEX_URL;
	}

	const url = Constants.expoConfig?.extra?.convexUrl;
	if (url) {
		return url;
	}

	console.warn(
		"CONVEX_URL not found. Please set EXPO_PUBLIC_CONVEX_URL in your .env file"
	);
	return "";
};

// Create Convex client with optional auth (expectAuth: false)
// This allows onboarding and basic features without authentication
const convex = new ConvexReactClient(getConvexUrl(), {
	expectAuth: false, // Auth is optional, not required
	unsavedChangesWarning: false,
});

function RootNavigator() {
	const { colors, isDark } = useTheme();

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<StatusBar style={isDark ? "light" : "dark"} />
			<Stack
				screenOptions={{
					headerStyle: {
						backgroundColor: colors.background,
					},
					headerTintColor: colors.text,
					headerTitleStyle: {
						fontWeight: "700",
					},
					contentStyle: {
						backgroundColor: colors.background,
					},
					animation: "fade_from_bottom",
					presentation: "transparentModal",
				}}
			>
				<Stack.Screen
					name="index"
					options={{
						headerShown: false,
						animation: "none",
						presentation: "card",
					}}
				/>
				<Stack.Screen name="(auth)" options={{ headerShown: false }} />
				<Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</View>
	);
}

export default function RootLayout() {
	return (
		<ConvexProvider client={convex}>
			<ConvexBetterAuthProvider client={convex} authClient={authClient}>
				<ThemeProvider>
					<AuthProvider>
						<RootNavigator />
					</AuthProvider>
				</ThemeProvider>
			</ConvexBetterAuthProvider>
		</ConvexProvider>
	);
}
