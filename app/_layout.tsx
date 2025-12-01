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
import { ConfigurationError } from "../components";
import Constants from "expo-constants";

// Get Convex URL from environment variables
const getConvexUrl = (): string | null => {
	if (process.env.EXPO_PUBLIC_CONVEX_URL) {
		const url = process.env.EXPO_PUBLIC_CONVEX_URL.trim();
		if (url && url.startsWith("http")) {
			return url;
		}
	}

	const url = Constants.expoConfig?.extra?.convexUrl;
	if (url && typeof url === "string" && url.trim().startsWith("http")) {
		return url.trim();
	}

	return null;
};

// Validate and create Convex client
const convexUrl = getConvexUrl();
let convex: ConvexReactClient | null = null;
let convexQueryClient: ConvexQueryClient | null = null;
let queryClient: QueryClient | null = null;

if (convexUrl) {
	try {
		convex = new ConvexReactClient(convexUrl, {
			expectAuth: false, // Auth is optional, not required
			unsavedChangesWarning: false,
		});
		// Create ConvexQueryClient and connect it to TanStack Query
		convexQueryClient = new ConvexQueryClient(convex);
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					queryKeyHashFn: convexQueryClient.hashFn(),
					queryFn: convexQueryClient.queryFn(),
				},
			},
		});
		convexQueryClient.connect(queryClient);
	} catch (error) {
		console.error("Error creating Convex client:", error);
		convex = null;
		convexQueryClient = null;
		queryClient = null;
	}
}

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
	// Show configuration error if Convex URL is not set
	if (!convex || !convexUrl || !queryClient || !convexQueryClient) {
		return (
			<GestureHandlerRootView style={{ flex: 1 }}>
				<ThemeProvider>
					<ConfigurationError
						message="La URL de Convex no está configurada. Por favor, configura tu archivo .env con la URL de tu deployment de Convex."
						instructions={[
							"Copia el archivo env.example a .env: cp env.example .env",
							"Si aún no tienes un deployment de Convex, ejecuta: npx convex dev",
							"Obtén tu URL de Convex (se verá como: https://tu-deployment.convex.cloud)",
							"Agrega la URL a tu archivo .env como: EXPO_PUBLIC_CONVEX_URL=https://tu-deployment.convex.cloud",
							"Reinicia tu servidor de desarrollo de Expo",
						]}
					/>
				</ThemeProvider>
			</GestureHandlerRootView>
		);
	}

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
