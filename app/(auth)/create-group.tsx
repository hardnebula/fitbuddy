import React, { useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	TouchableOpacity,
	Alert,
	Image,
	StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Card } from "../../components/Card";
import { useScrollIndicator } from "../../components/ScrollIndicator";
import { ScreenTransition } from "../../components/ScreenTransition";
import SquircleView from "../../components/SquircleView";
import { Theme } from "../../constants/Theme";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useGroups } from "../../lib/groups";

const SELECTED_GROUP_KEY = "fitbuddy_selected_group_id";

// Email validation helper
const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export default function CreateGroupScreen() {
	const router = useRouter();
	const { colors, isDark } = useTheme();
	const { userId } = useAuthContext();
	const { createGroupMutation } = useGroups();

	const [groupName, setGroupName] = useState("");
	const [members, setMembers] = useState<string[]>([]);
	const [memberInput, setMemberInput] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const {
		contentHeight,
		viewHeight,
		handleScroll,
		handleContentSizeChange,
		handleLayout,
	} = useScrollIndicator();

	const handleAddMember = () => {
		const trimmedEmail = memberInput.trim().toLowerCase();

		// Validation
		if (!trimmedEmail) {
			Alert.alert("Error", "Please enter an email address");
			return;
		}

		if (!isValidEmail(trimmedEmail)) {
			Alert.alert("Error", "Please enter a valid email address");
			return;
		}

		if (members.includes(trimmedEmail)) {
			Alert.alert("Error", "This email is already added");
			return;
		}

		if (members.length >= 4) {
			Alert.alert("Error", "You can only add up to 4 members");
			return;
		}

		setMembers([...members, trimmedEmail]);
		setMemberInput("");
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	};

	const handleRemoveMember = (email: string) => {
		setMembers(members.filter((m) => m !== email));
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
	};

	const handleCreateGroup = useCallback(async () => {
		if (!groupName.trim()) {
			Alert.alert("Error", "Please enter a group name");
			return;
		}

		if (!userId) {
			Alert.alert(
				"Sign In Required",
				"Please sign in to create a group",
				[
					{ text: "Cancel", style: "cancel" },
					{ text: "Sign In", onPress: () => router.push("/(auth)/sign-in") },
				]
			);
			return;
		}

		if (isCreating) return; // Prevent double submission

		setIsCreating(true);
		try {
			const newGroupId = await createGroupMutation.mutateAsync({
				name: groupName.trim(),
				createdBy: userId,
				memberEmails: members.length > 0 ? members : undefined,
			});

			// Set the newly created group as the selected group
			await AsyncStorage.setItem(SELECTED_GROUP_KEY, newGroupId);

			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

			// Navigate to home with the new group selected
			router.replace("/(tabs)/home");
		} catch (error: any) {
			console.error("Error creating group:", error);
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			Alert.alert(
				"Error",
				error.message || "Failed to create group. Please try again."
			);
		} finally {
			setIsCreating(false);
		}
	}, [groupName, userId, members, isCreating, createGroupMutation, router]);

	const canAddMember =
		memberInput.trim() &&
		isValidEmail(memberInput.trim()) &&
		members.length < 4 &&
		!members.includes(memberInput.trim().toLowerCase());

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
											Create Group
										</Text>
										<Text
											style={[styles.subtitle, { color: colors.textSecondary }]}
										>
											Start your fitness journey
										</Text>
									</View>
								</View>

								<View style={styles.heroImageContainer}>
									<Image
										source={require("../../assets/images/Teo Treadmill-Photoroom.png")}
										style={styles.logo}
										resizeMode="contain"
									/>
								</View>

								{/* Group Name Section */}
								<View style={styles.section}>
									<Input
										label="Group Name"
										placeholder="e.g., Morning Runners"
										value={groupName}
										onChangeText={setGroupName}
										autoCapitalize="words"
										containerStyle={styles.groupNameInput}
									/>
								</View>

								{/* Add Members Section */}
								<View style={styles.section}>
									<View style={styles.sectionHeader}>
										<Text style={[styles.sectionTitle, { color: colors.text }]}>
											Invite Members
										</Text>
										<Text
											style={[
												styles.remainingHint,
												{ color: colors.textTertiary },
											]}
										>
											{4 - members.length} spots left
										</Text>
									</View>

									<View style={styles.addMemberRow}>
										<View style={styles.emailInputContainer}>
											<Input
												placeholder="friend@example.com"
												value={memberInput}
												onChangeText={setMemberInput}
												keyboardType="email-address"
												autoCapitalize="none"
												autoCorrect={false}
												containerStyle={styles.emailInput}
												style={styles.emailInputField}
											/>
										</View>
										<Button
											title="Add"
											onPress={handleAddMember}
											disabled={!canAddMember}
											size="large"
											style={styles.addButton}
										/>
									</View>
								</View>

								{/* Members List */}
								{members.length > 0 && (
									<View style={styles.section}>
										<SquircleView
											style={[
												styles.membersCard,
												{ backgroundColor: colors.card },
											]}
											cornerSmoothing={1}
										>
											<View style={styles.membersHeader}>
												<Text
													style={[styles.membersTitle, { color: colors.text }]}
												>
													Added Members
												</Text>
											</View>
											<View style={styles.membersList}>
												{members.map((email, index) => (
													<View
														key={index}
														style={[
															styles.memberRow,
															{
																borderBottomColor: colors.border,
																borderBottomWidth:
																	index < members.length - 1 ? 1 : 0,
															},
														]}
													>
														<View style={styles.memberInfo}>
															<View
																style={[
																	styles.memberAvatar,
																	{ backgroundColor: colors.primary + "20" },
																]}
															>
																<Text
																	style={[
																		styles.memberInitial,
																		{ color: colors.primary },
																	]}
																>
																	{email.charAt(0).toUpperCase()}
																</Text>
															</View>
															<Text
																style={[
																	styles.memberEmail,
																	{ color: colors.text },
																]}
															>
																{email}
															</Text>
														</View>
														<TouchableOpacity
															onPress={() => handleRemoveMember(email)}
															style={[
																styles.removeButton,
																{
																	backgroundColor: colors.error + "15",
																},
															]}
														>
															<Svg
																width={16}
																height={16}
																viewBox="0 0 24 24"
																fill="none"
															>
																<Path
																	d="M18 6L6 18M6 6l12 12"
																	stroke={colors.error}
																	strokeWidth={2}
																	strokeLinecap="round"
																	strokeLinejoin="round"
																/>
															</Svg>
														</TouchableOpacity>
													</View>
												))}
											</View>
										</SquircleView>
									</View>
								)}

								{/* Invite Code Info Section */}
								<View style={styles.section}>
									<SquircleView
										style={[
											styles.infoCard,
											{
												backgroundColor: colors.cardSecondary,
												borderColor: colors.primary + "30",
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
											<View style={styles.infoRow}>
												<View
													style={[
														styles.infoIconContainer,
														{ backgroundColor: colors.primary + "20" },
													]}
												>
													<Svg
														width={20}
														height={20}
														viewBox="0 0 24 24"
														fill="none"
													>
														<Path
															d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
															stroke={colors.primary}
															strokeWidth={2}
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</Svg>
												</View>
												<Text
													style={[
														styles.infoText,
														{ color: colors.textSecondary },
													]}
												>
													An invite code will be generated when you create the
													group. Share it with friends to let them join!
												</Text>
											</View>
										</LinearGradient>
									</SquircleView>
								</View>

								{/* Create Button */}
								<View style={styles.createButtonContainer}>
									<Button
										title={isCreating ? "Creating Group..." : "Create Group"}
										onPress={handleCreateGroup}
										fullWidth
										size="large"
										loading={isCreating}
										disabled={!groupName.trim() || isCreating}
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
		width: 140,
		height: 140,
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
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: Theme.spacing.sm,
		paddingHorizontal: Theme.spacing.xs,
	},
	sectionTitle: {
		fontSize: Theme.typography.fontSize.lg,
		fontWeight: Theme.typography.fontWeight.bold,
	},
	sectionDescription: {
		fontSize: Theme.typography.fontSize.sm,
		marginBottom: Theme.spacing.sm,
		lineHeight:
			Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.sm,
	},
	inputContainer: {
		marginBottom: 0,
	},
	// Removed inputCard and inputField as they are no longer needed
	groupNameInput: {
		marginBottom: 0,
	},
	addMemberRow: {
		flexDirection: "row",
		gap: Theme.spacing.sm,
		alignItems: "flex-start",
	},
	emailInputContainer: {
		flex: 1,
	},
	emailInput: {
		marginBottom: 0,
	},
	emailInputField: {
		marginBottom: 0,
	},
	addButton: {
		width: 80,
		height: 56, // Match input height
		marginTop: 0, // Align with input top
	},
	remainingHint: {
		fontSize: Theme.typography.fontSize.xs,
		fontWeight: Theme.typography.fontWeight.medium,
	},
	membersCard: {
		borderRadius: Theme.borderRadius.xl,
		padding: Theme.spacing.lg,
	},
	membersHeader: {
		marginBottom: Theme.spacing.md,
	},
	membersTitle: {
		fontSize: Theme.typography.fontSize.md,
		fontWeight: Theme.typography.fontWeight.bold,
	},
	membersList: {
		gap: 0,
	},
	memberRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: Theme.spacing.md,
	},
	memberInfo: {
		flexDirection: "row",
		alignItems: "center",
		gap: Theme.spacing.md,
		flex: 1,
	},
	memberAvatar: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
	},
	memberInitial: {
		fontSize: Theme.typography.fontSize.md,
		fontWeight: Theme.typography.fontWeight.bold,
	},
	memberEmail: {
		fontSize: Theme.typography.fontSize.base,
		fontWeight: Theme.typography.fontWeight.medium,
		flex: 1,
	},
	removeButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: Theme.spacing.sm,
	},
	infoCard: {
		borderRadius: Theme.borderRadius.xl,
		borderWidth: 1,
		marginTop: Theme.spacing.sm,
		overflow: "hidden",
	},
	gradientBackground: {
		padding: Theme.spacing.lg,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Theme.spacing.md,
	},
	infoIconContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		flexShrink: 0,
	},
	infoText: {
		fontSize: Theme.typography.fontSize.sm,
		lineHeight: 20,
		flex: 1,
	},
	createButtonContainer: {
		marginTop: Theme.spacing.lg,
		marginBottom: Theme.spacing.xl,
	},
});
