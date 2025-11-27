import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	StatusBar,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Alert,
	TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useScrollIndicator } from "../../components/ScrollIndicator";
import { Theme } from "../../constants/Theme";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { authClient } from "../../lib/auth-client";
import { markOnboardingComplete } from "../../lib/onboarding";

// Email validation helper
const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export default function SignInScreen() {
	const router = useRouter();
	const { colors, isDark } = useTheme();
	const { login } = useAuthContext();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const {
		contentHeight,
		viewHeight,
		handleScroll,
		handleContentSizeChange,
		handleLayout,
	} = useScrollIndicator();

	const handleSignIn = async () => {
		// Validate inputs
		if (!email.trim()) {
			Alert.alert("Error", "Please enter your email address");
			return;
		}

		if (!isValidEmail(email.trim())) {
			Alert.alert("Error", "Please enter a valid email address");
			return;
		}

		if (!password.trim()) {
			Alert.alert("Error", "Please enter your password");
			return;
		}

		setIsLoading(true);

		try {
			// Sign in with Better Auth
			const result = await authClient.signIn.email({
				email: email.trim().toLowerCase(),
				password: password.trim(),
			});

			if (result.data?.user) {
				// Get user data from Better Auth
				const user = result.data.user;
				
				// Login to Convex (this will get or create user)
				await login(
					user.email || email.trim().toLowerCase(),
					user.name || "User",
					user.image || undefined
				);

				// Mark onboarding as complete since user already has account
				await markOnboardingComplete();

				// Navigate to home
				router.replace("/(tabs)/home");
			} else if (result.error) {
				// Handle Better Auth errors
				const errorMessage = result.error.message || "Invalid email or password";
				
				// Check if user doesn't exist (they need to go through onboarding)
				if (errorMessage.toLowerCase().includes("not found") || 
				    errorMessage.toLowerCase().includes("doesn't exist") ||
				    errorMessage.toLowerCase().includes("no account")) {
					Alert.alert(
						"Account Not Found",
						"You don't have an account yet. Please complete onboarding first.",
						[
							{
								text: "Go to Onboarding",
								onPress: () => router.replace("/(onboarding)/goal"),
							},
							{ text: "Cancel", style: "cancel" },
						]
					);
				} else {
					Alert.alert("Sign In Failed", errorMessage);
				}
			} else {
				Alert.alert("Error", "Invalid email or password");
			}
		} catch (error: any) {
			console.error("Sign in error:", error);
			const errorMessage = error?.message || error?.toString() || "An unexpected error occurred";
			
			// Check if it's a "user not found" type error
			if (errorMessage.toLowerCase().includes("not found") || 
			    errorMessage.toLowerCase().includes("doesn't exist") ||
			    errorMessage.toLowerCase().includes("no account") ||
			    errorMessage.toLowerCase().includes("invalid credentials")) {
				Alert.alert(
					"Account Not Found",
					"You don't have an account yet. Please complete onboarding first.",
					[
						{
							text: "Go to Onboarding",
							onPress: () => router.replace("/(onboarding)/goal"),
						},
						{ text: "Cancel", style: "cancel" },
					]
				);
			} else {
				Alert.alert(
					"Sign In Failed",
					errorMessage
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoToSignUp = () => {
		router.push("/(onboarding)/goal");
	};

	return (
		<>
			<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.background }]}
				edges={["top", "bottom"]}
			>
				<KeyboardAvoidingView
					style={styles.keyboardView}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
				>
					<View style={styles.scrollContainer} onLayout={handleLayout}>
						<ScrollView
							style={styles.scrollView}
							contentContainerStyle={styles.scrollContent}
							showsVerticalScrollIndicator={false}
							onScroll={handleScroll}
							onContentSizeChange={handleContentSizeChange}
							scrollEventThrottle={16}
							scrollEnabled={contentHeight > viewHeight + 5 && viewHeight > 0}
							keyboardShouldPersistTaps="handled"
						>
							<View style={styles.content}>
								<Text style={[styles.title, { color: colors.text }]}>
									Sign In
								</Text>
								<Text style={[styles.subtitle, { color: colors.textSecondary }]}>
									Welcome back! Sign in to continue.
								</Text>

								<View style={styles.form}>
									<Input
										label="Email"
										value={email}
										onChangeText={setEmail}
										placeholder="Enter your email"
										keyboardType="email-address"
										autoCapitalize="none"
										autoComplete="email"
										editable={!isLoading}
									/>

									<Input
										label="Password"
										value={password}
										onChangeText={setPassword}
										placeholder="Enter your password"
										secureTextEntry
										autoCapitalize="none"
										autoComplete="password"
										editable={!isLoading}
									/>
								</View>

								<View style={styles.buttonContainer}>
									<Button
										title="Sign In"
										onPress={handleSignIn}
										fullWidth
										size="large"
										disabled={isLoading}
									/>

									<View style={styles.signUpContainer}>
										<Text style={[styles.signUpText, { color: colors.textSecondary }]}>
											Don't have an account?{" "}
										</Text>
										<TouchableOpacity
											onPress={handleGoToSignUp}
											disabled={isLoading}
										>
											<Text style={[styles.signUpLink, { color: colors.primary }]}>
												Get Started
											</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</ScrollView>
					</View>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	keyboardView: {
		flex: 1,
	},
	scrollContainer: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: Theme.spacing.xl,
		flexGrow: 1,
	},
	content: {
		paddingTop: Theme.spacing.xl * 2,
		paddingBottom: Theme.spacing.xl,
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
		marginBottom: Theme.spacing.sm,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 18,
		marginBottom: Theme.spacing.xl * 2,
		textAlign: "center",
		lineHeight: 26,
	},
	form: {
		gap: Theme.spacing.lg,
		marginBottom: Theme.spacing.xl,
	},
	buttonContainer: {
		gap: Theme.spacing.md,
	},
	signUpContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: Theme.spacing.md,
	},
	signUpText: {
		fontSize: 16,
	},
	signUpLink: {
		fontSize: 16,
		fontWeight: "600",
	},
});

