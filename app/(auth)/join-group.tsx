import React, { useState, useCallback, useMemo } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	TouchableOpacity,
	Alert,
	StatusBar,
	ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Logo } from "../../components/Logo";
import { useScrollIndicator } from "../../components/ScrollIndicator";
import { ScreenTransition } from "../../components/ScreenTransition";
import SquircleView from "../../components/SquircleView";
import { Theme } from "../../constants/Theme";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useGroups, useGroupByInviteCode } from "../../lib/groups";
import { markOnboardingComplete } from "../../lib/onboarding";

const SELECTED_GROUP_KEY = "teo_selected_group_id";

export default function JoinGroupScreen() {
	const router = useRouter();
	const { colors, isDark } = useTheme();
	const { userId } = useAuthContext();
	const { joinGroupMutation } = useGroups();

	const [inviteCode, setInviteCode] = useState("");
	const [isJoining, setIsJoining] = useState(false);
	const {
		contentHeight,
		viewHeight,
		handleScroll,
		handleContentSizeChange,
		handleLayout,
	} = useScrollIndicator();

	// Query for group preview when invite code is entered
	const normalizedCode = useMemo(() => {
		const trimmed = inviteCode.trim().toUpperCase();
		// Only query if it looks like a valid invite code (FITBUDDY-XXXXXX format)
		return trimmed.length >= 8 ? trimmed : null;
	}, [inviteCode]);

	const groupPreview = useGroupByInviteCode(normalizedCode);

	const handleJoinGroup = useCallback(async () => {
		if (!inviteCode.trim()) {
			Alert.alert("Error", "Please enter an invite code");
			return;
		}

		if (!userId) {
			// Navigate directly to sign-in page with context
			router.push({
				pathname: "/(auth)/sign-in",
				params: { reason: "join-group" },
			});
			return;
		}

		if (isJoining) return; // Prevent double submission

		setIsJoining(true);
		try {
			const groupId = await joinGroupMutation.mutateAsync({
				inviteCode: inviteCode.trim().toUpperCase(),
				userId,
			});

			// Set the joined group as the selected group
			await AsyncStorage.setItem(SELECTED_GROUP_KEY, groupId);

			// Mark onboarding as complete (if not already) since user has joined a group
			await markOnboardingComplete();

			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

			// Navigate to root index to reset the entire navigation stack
			// The index route will check onboarding status and redirect to /(tabs)/home
			// This ensures we clear all auth screens from the stack properly
			router.replace("/");
		} catch (error: any) {
			console.error("Error joining group:", error);
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

			let errorMessage = "Failed to join group. Please try again.";
			if (error.message?.includes("not found")) {
				errorMessage = "Invalid invite code. Please check and try again.";
			} else if (error.message?.includes("full")) {
				errorMessage = "This group is full (max 4 members).";
			} else if (error.message?.includes("archived")) {
				errorMessage = "This group has been archived.";
			}

			Alert.alert("Error", errorMessage);
		} finally {
			setIsJoining(false);
		}
	}, [inviteCode, userId, isJoining, joinGroupMutation, router]);

	return (
		<ScreenTransition>
			<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.background }]}
				edges={["top", "bottom"]}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					style={styles.keyboardView}
				>
					<View style={styles.scrollContainer} onLayout={handleLayout}>
						<ScrollView
							contentContainerStyle={styles.scrollContent}
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
							onScroll={handleScroll}
							onContentSizeChange={handleContentSizeChange}
							scrollEventThrottle={16}
							scrollEnabled={contentHeight > viewHeight + 5 && viewHeight > 0}
							bounces={true}
							alwaysBounceVertical={false}
							nestedScrollEnabled={false}
						>
							<View style={styles.content}>
								{/* Header */}
								<View style={styles.headerContainer}>
									<TouchableOpacity
										onPress={() => router.back()}
										style={[
											styles.backButton,
											{ backgroundColor: colors.cardSecondary },
										]}
									>
										<Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
											<Path
												d="M15 18l-6-6 6-6"
												stroke={colors.text}
												strokeWidth={2}
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</Svg>
									</TouchableOpacity>
									<View style={styles.headerTextContainer}>
										<Text style={[styles.title, { color: colors.text }]}>
											Join Group
										</Text>
										<Text
											style={[styles.subtitle, { color: colors.textSecondary }]}
										>
											Enter invite code to join
										</Text>
									</View>
								</View>

								<View style={styles.heroImageContainer}>
									<Logo size={120} style={styles.logo} />
								</View>

								{/* Invite Code Section */}
								<View style={styles.section}>
									<Input
										label="Invite Code"
										placeholder="FITBUDDY-XXXXXX"
										value={inviteCode}
										onChangeText={(text) => {
											// Format invite code: uppercase and add dash if needed
											const formatted = text
												.toUpperCase()
												.replace(/[^A-Z0-9-]/g, "");
											setInviteCode(formatted);
										}}
										autoCapitalize="characters"
										containerStyle={styles.inputContainer}
										style={{
											fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
											letterSpacing: 1,
											fontSize: Theme.typography.fontSize.lg,
											fontWeight: Theme.typography.fontWeight.semibold,
										}}
									/>
								</View>

								{/* Group Preview */}
								{normalizedCode && (
									<View style={styles.section}>
										{groupPreview === undefined ? (
											<SquircleView
												style={[
													styles.previewCard,
													{
														backgroundColor: colors.cardSecondary,
														borderColor: colors.border,
													},
												]}
												cornerSmoothing={1}
											>
												<View style={styles.loadingContainer}>
													<ActivityIndicator
														size="small"
														color={colors.primary}
													/>
													<Text
														style={[
															styles.loadingText,
															{ color: colors.textSecondary },
														]}
													>
														Looking for group...
													</Text>
												</View>
											</SquircleView>
										) : groupPreview ? (
											<SquircleView
												style={[
													styles.previewCard,
													{
														backgroundColor: colors.card,
														borderColor: colors.primary,
														borderWidth: 2,
													},
												]}
												cornerSmoothing={1}
											>
												<LinearGradient
													colors={
														isDark
															? [
																	"rgba(139, 92, 246, 0.15)",
																	"rgba(139, 92, 246, 0.05)",
																]
															: [
																	"rgba(139, 92, 246, 0.1)",
																	"rgba(139, 92, 246, 0.02)",
																]
													}
													start={{ x: 0, y: 0 }}
													end={{ x: 1, y: 1 }}
													style={styles.gradientBackground}
												>
													<View style={styles.previewHeader}>
														<View
															style={[
																styles.successIcon,
																{ backgroundColor: colors.primary },
															]}
														>
															<Svg
																width={16}
																height={16}
																viewBox="0 0 24 24"
																fill="none"
															>
																<Path
																	d="M20 6L9 17l-5-5"
																	stroke="#FFFFFF"
																	strokeWidth={3}
																	strokeLinecap="round"
																	strokeLinejoin="round"
																/>
															</Svg>
														</View>
														<Text
															style={[
																styles.previewTitle,
																{ color: colors.text },
															]}
														>
															Group Found!
														</Text>
													</View>

													<View style={styles.previewContent}>
														<Text
															style={[styles.groupName, { color: colors.text }]}
														>
															{groupPreview.name}
														</Text>
														<View style={styles.statsContainer}>
															<View
																style={[
																	styles.statBadge,
																	{
																		backgroundColor: colors.primary + "15",
																	},
																]}
															>
																<Text
																	style={[
																		styles.statText,
																		{ color: colors.primary },
																	]}
																>
																	🔥 {groupPreview.groupStreak} Days Streak
																</Text>
															</View>
														</View>
													</View>
												</LinearGradient>
											</SquircleView>
										) : (
											<SquircleView
												style={[
													styles.previewCard,
													{
														backgroundColor: colors.card,
														borderColor: colors.error + "50",
														borderWidth: 1,
													},
												]}
												cornerSmoothing={1}
											>
												<View style={styles.errorContainer}>
													<View
														style={[
															styles.errorIcon,
															{ backgroundColor: colors.error + "20" },
														]}
													>
														<Svg
															width={24}
															height={24}
															viewBox="0 0 24 24"
															fill="none"
														>
															<Path
																d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
																stroke={colors.error}
																strokeWidth={2}
																strokeLinecap="round"
																strokeLinejoin="round"
															/>
														</Svg>
													</View>
													<View style={styles.errorTextContainer}>
														<Text
															style={[
																styles.errorTitle,
																{ color: colors.error },
															]}
														>
															Group Not Found
														</Text>
														<Text
															style={[
																styles.errorDescription,
																{ color: colors.textSecondary },
															]}
														>
															Please check the invite code and try again.
														</Text>
													</View>
												</View>
											</SquircleView>
										)}
									</View>
								)}

								{/* Join Button */}
								<View style={styles.joinButtonContainer}>
									<Button
										title={isJoining ? "Joining Group..." : "Join Group"}
										onPress={handleJoinGroup}
										fullWidth
										size="large"
										loading={isJoining}
										disabled={
											!inviteCode.trim() ||
											isJoining ||
											(normalizedCode !== null && groupPreview === null)
										}
									/>
								</View>
							</View>
						</ScrollView>
					</View>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</ScreenTransition>
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
	scrollContent: {
		flexGrow: 1,
		paddingBottom: Theme.spacing.xxl,
	},
	content: {
		paddingHorizontal: Theme.spacing.lg,
		paddingTop: Theme.spacing.md,
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Theme.spacing.xl,
	},
	backButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: "center",
		alignItems: "center",
		marginRight: Theme.spacing.md,
	},
	headerTextContainer: {
		flex: 1,
	},
	heroImageContainer: {
		alignItems: "center",
		marginBottom: Theme.spacing.xl,
	},
	logo: {
		marginBottom: Theme.spacing.md,
	},
	title: {
		fontSize: Theme.typography.fontSize["2xl"],
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: 2,
	},
	subtitle: {
		fontSize: Theme.typography.fontSize.sm,
	},
	section: {
		marginBottom: Theme.spacing.lg,
	},
	inputContainer: {
		marginBottom: 0,
	},
	previewCard: {
		marginTop: Theme.spacing.sm,
		borderRadius: Theme.borderRadius.xl,
		overflow: "hidden",
		borderWidth: 1,
	},
	gradientBackground: {
		padding: Theme.spacing.lg,
	},
	previewHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Theme.spacing.md,
		gap: Theme.spacing.sm,
	},
	successIcon: {
		width: 24,
		height: 24,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	previewTitle: {
		fontSize: Theme.typography.fontSize.md,
		fontWeight: Theme.typography.fontWeight.bold,
	},
	previewContent: {
		gap: Theme.spacing.sm,
	},
	groupName: {
		fontSize: Theme.typography.fontSize.xl,
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: Theme.spacing.xs,
	},
	statsContainer: {
		flexDirection: "row",
	},
	statBadge: {
		paddingHorizontal: Theme.spacing.md,
		paddingVertical: Theme.spacing.xs,
		borderRadius: Theme.borderRadius.full,
	},
	statText: {
		fontWeight: Theme.typography.fontWeight.bold,
		fontSize: Theme.typography.fontSize.sm,
	},
	loadingContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Theme.spacing.sm,
		padding: Theme.spacing.xl,
	},
	loadingText: {
		fontSize: Theme.typography.fontSize.base,
		fontWeight: Theme.typography.fontWeight.medium,
	},
	errorContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: Theme.spacing.lg,
		gap: Theme.spacing.md,
	},
	errorIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	errorTextContainer: {
		flex: 1,
	},
	errorTitle: {
		fontSize: Theme.typography.fontSize.md,
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: 2,
	},
	errorDescription: {
		fontSize: Theme.typography.fontSize.sm,
	},
	joinButtonContainer: {
		marginTop: Theme.spacing.lg,
		marginBottom: Theme.spacing.xl,
	},
});
