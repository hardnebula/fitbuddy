import React, { useState, useEffect } from "react";
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
	Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { useScrollIndicator } from "../../components/ScrollIndicator";
import { Theme } from "../../constants/Theme";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { authClient } from "../../lib/auth-client";
import {
	markOnboardingComplete,
	isOnboardingComplete,
} from "../../lib/onboarding";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";

export default function SignInScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{ reason?: string }>();
	const { colors, isDark } = useTheme();
	const { login } = useAuthContext();
	const migrateUserData = useConvexMutation(api.users.migrateAnonymousUserData);
	const [isLoading, setIsLoading] = useState(false);
	const [loadingProvider, setLoadingProvider] = useState<
		"apple" | "google" | null
	>(null);
	const [showGetStarted, setShowGetStarted] = useState(false);
	const [signInContext, setSignInContext] = useState<
		"welcome" | "create-group" | "join-group" | "other"
	>("welcome");
	const {
		contentHeight,
		viewHeight,
		handleScroll,
		handleContentSizeChange,
		handleLayout,
	} = useScrollIndicator();

	// Check onboarding status and navigation context
	useEffect(() => {
		const checkContext = async () => {
			const onboardingComplete = await isOnboardingComplete();

			// Determine context based on route params and onboarding status
			if (params.reason === "create-group") {
				setSignInContext("create-group");
				setShowGetStarted(false); // Don't show "Get Started" when coming from create-group
			} else if (params.reason === "join-group") {
				setSignInContext("join-group");
				setShowGetStarted(false);
			} else if (!onboardingComplete) {
				// Coming from landing/welcome page
				setSignInContext("welcome");
				setShowGetStarted(true);
			} else {
				setSignInContext("other");
				setShowGetStarted(false);
			}
		};
		checkContext();
	}, [params.reason]);

	const handleSocialSignIn = async (provider: "apple" | "google") => {
		setIsLoading(true);
		setLoadingProvider(provider);

		try {
			// Check if user was previously anonymous
			const sessionBefore = await authClient.getSession();
			const anonymousEmail = sessionBefore?.data?.user?.isAnonymous
				? sessionBefore.data.user.email
				: null;

			// Sign in with Better Auth - it handles the OAuth flow automatically
			// Better Auth will automatically link anonymous accounts via onLinkAccount callback
			const result = await authClient.signIn.social({
				provider,
				callbackURL: "/(tabs)/home",
			});

			// Check if result has user (success) or url (redirect)
			if (result.data && "user" in result.data) {
				const user = result.data.user;

				// Migrate Convex user data if user was previously anonymous
				if (anonymousEmail && anonymousEmail !== user.email) {
					try {
						await migrateUserData({
							anonymousEmail,
							newEmail: user.email || `${provider}-user@${provider}.com`,
						});
					} catch (migrationError) {
						console.error("Error migrating user data:", migrationError);
						// Continue even if migration fails
					}
				}

				// Login to Convex (this will get or create user)
				await login(
					user.email || `${provider}-user@${provider}.com`,
					user.name || "User",
					user.image || undefined
				);

				// Mark onboarding as complete since user already has account
				await markOnboardingComplete();

				// Navigate to home
				router.replace("/(tabs)/home");
			} else if (result.data && "url" in result.data) {
				// Redirect case - Better Auth handles this automatically via Expo plugin
				// The redirect will complete the OAuth flow and call the callbackURL
				return;
			} else if (result.error) {
				const errorMessage =
					result.error.message || `${provider} Sign In failed`;
				Alert.alert("Sign In Failed", errorMessage);
			}
		} catch (error: any) {
			console.error(`${provider} Sign In error:`, error);

			// Handle user cancellation
			if (
				error.code === "ERR_CANCELED" ||
				error.message?.includes("canceled")
			) {
				return; // User canceled, don't show error
			}

			const errorMessage =
				error?.message || error?.toString() || "An unexpected error occurred";
			Alert.alert("Sign In Failed", errorMessage);
		} finally {
			setIsLoading(false);
			setLoadingProvider(null);
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
								{/* Hero Logo */}
								<View style={styles.logoContainer}>
									<Image
										source={require("../../assets/images/Logo-teo-Photoroom.png")}
										style={styles.logo}
										resizeMode="contain"
									/>
								</View>

								{/* Header Text - Context-aware messaging */}
								<View style={styles.headerContainer}>
									<Text style={[styles.title, { color: colors.text }]}>
										{signInContext === "create-group"
											? "Sign In to Create Your Group"
											: signInContext === "join-group"
												? "Sign In to Join a Group"
												: "Welcome Back!"}
									</Text>
									<Text
										style={[styles.subtitle, { color: colors.textSecondary }]}
									>
										{signInContext === "create-group"
											? "Create your group and start your journey with friends. Sign in to get started!"
											: signInContext === "join-group"
												? "Join your friends' group and stay accountable together. Sign in to continue!"
												: "Sign in to continue your journey with your group"}
									</Text>
								</View>

								<View style={styles.buttonContainer}>
									{/* Apple Sign In Button */}
									{Platform.OS === "ios" && (
										<Button
											title={
												loadingProvider === "apple"
													? "Signing in..."
													: "Continue with Apple"
											}
											onPress={() => handleSocialSignIn("apple")}
											fullWidth
											size="large"
											loading={loadingProvider === "apple"}
											disabled={isLoading}
											style={styles.socialButton}
										/>
									)}

									{/* Google Sign In Button */}
									<Button
										title={
											loadingProvider === "google"
												? "Signing in..."
												: "Continue with Google"
										}
										onPress={() => handleSocialSignIn("google")}
										fullWidth
										size="large"
										variant={Platform.OS === "ios" ? "outline" : "primary"}
										loading={loadingProvider === "google"}
										disabled={isLoading}
										style={styles.socialButton}
									/>

									{/* Divider - Only show when "Get Started" is visible */}
									{showGetStarted && (
										<View style={styles.dividerContainer}>
											<View
												style={[
													styles.divider,
													{ backgroundColor: colors.border },
												]}
											/>
											<Text
												style={[
													styles.dividerText,
													{ color: colors.textSecondary },
												]}
											>
												or
											</Text>
											<View
												style={[
													styles.divider,
													{ backgroundColor: colors.border },
												]}
											/>
										</View>
									)}

									{/* Sign Up Link - Only show "Get Started" when onboarding is not complete */}
									{showGetStarted && (
										<View style={styles.signUpContainer}>
											<Text
												style={[
													styles.signUpText,
													{ color: colors.textSecondary },
												]}
											>
												Don't have an account?{" "}
											</Text>
											<TouchableOpacity
												onPress={handleGoToSignUp}
												disabled={isLoading}
											>
												<Text
													style={[styles.signUpLink, { color: colors.primary }]}
												>
													Get Started
												</Text>
											</TouchableOpacity>
										</View>
									)}

									{/* Trust Indicator */}
									<View style={styles.trustContainer}>
										<Text
											style={[styles.trustText, { color: colors.textTertiary }]}
										>
											🔒 Secure sign in with one tap
										</Text>
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
		paddingTop: Theme.spacing.lg,
		paddingBottom: Theme.spacing.xl,
		minHeight: "100%",
		justifyContent: "center",
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: Theme.spacing.xl,
		paddingTop: Theme.spacing.md,
	},
	logo: {
		width: 120,
		height: 120,
	},
	headerContainer: {
		alignItems: "center",
		marginBottom: Theme.spacing.xl * 2,
		paddingHorizontal: Theme.spacing.md,
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
		marginBottom: Theme.spacing.sm,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		lineHeight: 24,
		paddingHorizontal: Theme.spacing.sm,
	},
	buttonContainer: {
		gap: Theme.spacing.md,
	},
	socialButton: {
		width: "100%",
		marginBottom: Theme.spacing.sm,
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: Theme.spacing.lg,
	},
	divider: {
		flex: 1,
		height: 1,
	},
	dividerText: {
		marginHorizontal: Theme.spacing.md,
		fontSize: Theme.typography.fontSize.sm,
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
	trustContainer: {
		marginTop: Theme.spacing.lg,
		alignItems: "center",
	},
	trustText: {
		fontSize: Theme.typography.fontSize.sm,
		textAlign: "center",
	},
});
