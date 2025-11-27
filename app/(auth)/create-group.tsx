import React, { useState } from "react";
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
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Card } from "../../components/Card";
import { useScrollIndicator } from "../../components/ScrollIndicator";
import { Theme } from "../../constants/Theme";
import { useTheme } from "../../contexts/ThemeContext";

// Email validation helper
const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export default function CreateGroupScreen() {
	const router = useRouter();
	const { colors, isDark } = useTheme();
	const [groupName, setGroupName] = useState("");
	const [members, setMembers] = useState<string[]>([]);
	const [memberInput, setMemberInput] = useState("");
	const [inviteCode] = useState(
		"FITBUDDY-" + Math.random().toString(36).substr(2, 6).toUpperCase()
	);
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

	const handleCopyInviteCode = async () => {
		await Clipboard.setStringAsync(inviteCode);
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		Alert.alert("Copied!", "Invite code copied to clipboard");
	};

	const handleCreateGroup = () => {
		if (!groupName.trim()) {
			Alert.alert("Error", "Please enter a group name");
			return;
		}
		// Navigate to main app
		router.replace("/(tabs)/home");
	};

	const canAddMember =
		memberInput.trim() &&
		isValidEmail(memberInput.trim()) &&
		members.length < 4 &&
		!members.includes(memberInput.trim().toLowerCase());

	return (
		<>
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
							bounces={contentHeight > viewHeight + 5 && viewHeight > 0}
							alwaysBounceVertical={false}
							nestedScrollEnabled={false}
						>
							<View style={styles.content}>
								{/* Header */}
								<TouchableOpacity
									onPress={() => router.back()}
									style={styles.backButton}
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

								<View style={styles.header}>
									<Image
										source={require("../../assets/images/Teo Treadmill-Photoroom.png")}
										style={styles.logo}
										resizeMode="contain"
									/>
									<Text style={[styles.title, { color: colors.text }]}>
										Create Your Group
									</Text>
									<Text
										style={[styles.subtitle, { color: colors.textSecondary }]}
									>
										Invite friends to join your fitness journey
									</Text>
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
									<Text style={[styles.sectionTitle, { color: colors.text }]}>
										Invite Members
									</Text>
									<Text
										style={[
											styles.sectionDescription,
											{ color: colors.textSecondary },
										]}
									>
										Add up to 4 friends by email
									</Text>

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
											size="medium"
											style={styles.addButton}
										/>
									</View>

									{members.length > 0 && members.length < 4 && (
										<Text
											style={[
												styles.remainingHint,
												{ color: colors.textTertiary },
											]}
										>
											{4 - members.length} spot
											{4 - members.length !== 1 ? "s" : ""} remaining
										</Text>
									)}
								</View>

								{/* Members List */}
								{members.length > 0 && (
									<View style={styles.section}>
										<Card
											style={StyleSheet.flatten([
												styles.membersCard,
												{ backgroundColor: colors.card },
											])}
										>
											<View style={styles.membersHeader}>
												<Text
													style={[styles.membersTitle, { color: colors.text }]}
												>
													Members ({members.length}/4)
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
														<Text
															style={[
																styles.memberEmail,
																{ color: colors.text },
															]}
														>
															{email}
														</Text>
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
										</Card>
									</View>
								)}

								{/* Invite Code Section */}
								<View style={styles.section}>
									<Text style={[styles.sectionTitle, { color: colors.text }]}>
										Invite Code
									</Text>
									<Text
										style={[
											styles.sectionDescription,
											{ color: colors.textSecondary },
										]}
									>
										Share this code with friends to join your group
									</Text>

									<TouchableOpacity
										onPress={handleCopyInviteCode}
										style={[
											styles.inviteCodeCard,
											{
												backgroundColor: colors.card,
												borderColor: colors.border,
											},
										]}
										activeOpacity={0.8}
									>
										<View style={styles.inviteCodeRow}>
											<Text
												style={[styles.inviteCode, { color: colors.primary }]}
											>
												{inviteCode}
											</Text>
											<View
												style={[
													styles.copyIconContainer,
													{
														backgroundColor: colors.primary + "15",
													},
												]}
											>
												<Svg
													width={20}
													height={20}
													viewBox="0 0 24 24"
													fill="none"
												>
													<Path
														d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
														fill={colors.primary}
													/>
												</Svg>
											</View>
										</View>
										<Text
											style={[styles.copyHint, { color: colors.textTertiary }]}
										>
											Tap to copy
										</Text>
									</TouchableOpacity>
								</View>

								{/* Create Button */}
								<View style={styles.createButtonContainer}>
									<Button
										title="Create Group"
										onPress={handleCreateGroup}
										fullWidth
										size="large"
										disabled={!groupName.trim()}
									/>
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
	scrollContent: {
		flexGrow: 1,
		paddingBottom: Theme.spacing.md,
	},
	content: {
		paddingHorizontal: Theme.spacing.xl,
		paddingTop: Theme.spacing.md,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "flex-start",
		marginBottom: Theme.spacing.lg,
	},
	header: {
		alignItems: "center",
		marginBottom: Theme.spacing.xl,
	},
	logo: {
		width: 100,
		height: 100,
		marginBottom: Theme.spacing.md,
	},
	title: {
		fontSize: Theme.typography.fontSize["3xl"],
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: Theme.spacing.xs,
		textAlign: "center",
	},
	subtitle: {
		fontSize: Theme.typography.fontSize.base,
		textAlign: "center",
		lineHeight:
			Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.base,
	},
	section: {
		marginBottom: Theme.spacing.lg,
	},
	sectionTitle: {
		fontSize: Theme.typography.fontSize.lg,
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: Theme.spacing.xs / 2,
	},
	sectionDescription: {
		fontSize: Theme.typography.fontSize.sm,
		marginBottom: Theme.spacing.sm,
		lineHeight:
			Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.sm,
	},
	groupNameInput: {
		marginBottom: 0,
	},
	addMemberRow: {
		flexDirection: "row",
		gap: Theme.spacing.md,
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
		minWidth: 80,
		marginTop: Theme.spacing.xs + 2,
	},
	remainingHint: {
		fontSize: Theme.typography.fontSize.xs,
		marginTop: Theme.spacing.sm,
		marginLeft: Theme.spacing.xs,
	},
	membersCard: {
		marginTop: Theme.spacing.sm,
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
	memberEmail: {
		fontSize: Theme.typography.fontSize.base,
		fontWeight: Theme.typography.fontWeight.medium,
		flex: 1,
	},
	removeButton: {
		width: 28,
		height: 28,
		borderRadius: Theme.borderRadius.md,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: Theme.spacing.sm,
	},
	inviteCodeCard: {
		borderRadius: Theme.borderRadius.xl,
		borderWidth: 2,
		padding: Theme.spacing.lg,
		marginTop: Theme.spacing.sm,
	},
	inviteCodeRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: Theme.spacing.xs,
	},
	inviteCode: {
		fontSize: Theme.typography.fontSize["2xl"],
		fontWeight: Theme.typography.fontWeight.bold,
		letterSpacing: 2,
		fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
		flex: 1,
	},
	copyIconContainer: {
		width: 40,
		height: 40,
		borderRadius: Theme.borderRadius.md,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: Theme.spacing.md,
	},
	copyHint: {
		fontSize: Theme.typography.fontSize.xs,
		textAlign: "center",
		marginTop: Theme.spacing.xs,
	},
	createButtonContainer: {
		marginTop: Theme.spacing.sm,
		marginBottom: Theme.spacing.md,
	},
});
