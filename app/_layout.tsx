import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

// Create ConvexQueryClient and connect it to TanStack Query
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryKeyHashFn: convexQueryClient.hashFn(),
			queryFn: convexQueryClient.queryFn(),
		},
	},
});
convexQueryClient.connect(queryClient);

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
				<Stack.Screen
					name="(auth)"
					options={{
						headerShown: false,
						animation: "slide_from_right",
						presentation: "card",
					}}
				/>
				<Stack.Screen
					name="(onboarding)"
					options={{
						headerShown: false,
						animation: "slide_from_right",
						presentation: "card",
					}}
				/>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</View>
	);
}

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ConvexProvider client={convex}>
				<QueryClientProvider client={queryClient}>
					<ConvexBetterAuthProvider client={convex} authClient={authClient}>
						<ThemeProvider>
							<AuthProvider>
								<RootNavigator />
							</AuthProvider>
						</ThemeProvider>
					</ConvexBetterAuthProvider>
				</QueryClientProvider>
			</ConvexProvider>
		</GestureHandlerRootView>
	);
}
