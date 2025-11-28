import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	StatusBar,
	RefreshControl,
	Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { ScreenTransition } from "@/components/ScreenTransition";
import SquircleView from "@/components/SquircleView";
import { Theme } from "@/constants/Theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserGroups } from "@/lib/groups";
import { useGroupSelection } from "@/hooks/useGroupSelection";
import { Id } from "@/convex/_generated/dataModel";
import { getLocalUserStats, LocalUserStats } from "@/lib/localCheckIns";

export default function GroupsScreen() {
	const router = useRouter();
	const { colors, isDark } = useTheme();
	const { userId, user, isLoading: authLoading } = useAuthContext();

	// Fetch user's groups from Convex
	const groups = useUserGroups(userId);

	// Group selection state
	const {
		selectedGroupId,
		setSelectedGroupId,
		isLoading: groupSelectionLoading,
	} = useGroupSelection(groups);

	// Local stats for anonymous users
	const [localStats, setLocalStats] = useState<LocalUserStats>({
		currentStreak: 0,
		bestStreak: 0,
		totalCheckIns: 0,
		lastCheckIn: undefined,
	});

	// Refresh state
	const [refreshing, setRefreshing] = useState(false);

	// Load local stats for anonymous users
	useEffect(() => {
		if (!userId) {
			loadLocalStats();
		}
	}, [userId]);

	const loadLocalStats = async () => {
		const stats = await getLocalUserStats();
		setLocalStats(stats);
	};

	const onRefresh = async () => {
		setRefreshing(true);
		if (!userId) {
			await loadLocalStats();
		}
		// For logged-in users, Convex queries auto-refresh
		setRefreshing(false);
	};

	const handleCreateGroup = () => {
		router.push("/(auth)/create-group");
	};

	const handleJoinGroup = () => {
		router.push("/(auth)/join-group");
	};

	const handleSelectGroup = (groupId: Id<"groups">) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setSelectedGroupId(groupId);
		// Navigate to home tab to show the selected group
		router.push("/(tabs)/home");
	};

	const handleGoToPersonal = async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		await setSelectedGroupId(null);
		router.push("/(tabs)/home");
	};

	// Get user stats
	const currentStreak = userId
		? user?.currentStreak || 0
		: localStats.currentStreak;
	const bestStreak = userId ? user?.bestStreak || 0 : localStats.bestStreak;
	const totalCheckIns = userId
		? user?.totalCheckIns || 0
		: localStats.totalCheckIns;

	// Show loading state
	if (authLoading || groupSelectionLoading) {
		return (
			<ScreenTransition>
				<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
				<SafeAreaView
					style={[styles.container, { backgroundColor: colors.background }]}
				>
					<View style={styles.loadingContainer}>
						<Image
							source={require("@/assets/images/Teo sleeping.png")}
							style={styles.loadingImage}
							resizeMode="contain"
						/>
					</View>
				</SafeAreaView>
			</ScreenTransition>
		);
	}

	return (
		<ScreenTransition>
			<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.background }]}
				edges={["top"]}
			>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					bounces={true}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							tintColor={colors.primary}
						/>
					}
				>
					{/* Header */}
					<View style={styles.header}>
						<Text style={[styles.title, { color: colors.text }]}>
							Your Dashboard
						</Text>
					</View>

					{/* Personal Stats Card */}
					<TouchableOpacity onPress={handleGoToPersonal} activeOpacity={0.8}>
						<SquircleView
							style={[
								styles.personalCard,
								{
									borderRadius: 24,
									borderColor:
										selectedGroupId === null ? colors.primary : colors.border,
									borderWidth: selectedGroupId === null ? 2 : 1,
								},
							]}
							cornerSmoothing={1.0}
						>
							<LinearGradient
								colors={
									isDark
										? ["rgba(139, 92, 246, 0.15)", "rgba(139, 92, 246, 0.05)"]
										: ["rgba(139, 92, 246, 0.1)", "rgba(139, 92, 246, 0.03)"]
								}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.personalCardGradient}
							>
								<View style={styles.personalCardHeader}>
									<View style={styles.personalCardTitleRow}>
										<View
											style={[
												styles.personalIcon,
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
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													stroke={colors.primary}
													d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
												/>
											</Svg>
										</View>
										<View style={styles.personalCardTitleText}>
											<Text
												style={[
													styles.personalCardTitle,
													{ color: colors.text },
												]}
											>
												Personal
											</Text>
											<Text
												style={[
													styles.personalCardSubtitle,
													{ color: colors.textSecondary },
												]}
											>
												Your individual progress
											</Text>
										</View>
									</View>
								</View>

								<View style={styles.statsRow}>
									<View style={styles.statItem}>
										<Text style={[styles.statValue, { color: colors.primary }]}>
											{currentStreak}
										</Text>
										<Text
											style={[
												styles.statLabel,
												{ color: colors.textSecondary },
											]}
										>
											Streak 🔥
										</Text>
									</View>
									<View
										style={[
											styles.statDivider,
											{ backgroundColor: colors.border },
										]}
									/>
									<View style={styles.statItem}>
										<Text style={[styles.statValue, { color: colors.text }]}>
											{totalCheckIns}
										</Text>
										<Text
											style={[
												styles.statLabel,
												{ color: colors.textSecondary },
											]}
										>
											Check-ins
										</Text>
									</View>
									<View
										style={[
											styles.statDivider,
											{ backgroundColor: colors.border },
										]}
									/>
									<View style={styles.statItem}>
										<Text style={[styles.statValue, { color: colors.text }]}>
											{bestStreak}
										</Text>
										<Text
											style={[
												styles.statLabel,
												{ color: colors.textSecondary },
											]}
										>
											Best
										</Text>
									</View>
								</View>
							</LinearGradient>
						</SquircleView>
					</TouchableOpacity>

					{/* Groups Section */}
					<View style={styles.sectionHeader}>
						<Text style={[styles.sectionTitle, { color: colors.text }]}>
							Your Groups
						</Text>
						<Text
							style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
						>
							{groups && groups.length > 0
								? `${groups.length} ${groups.length === 1 ? "group" : "groups"}`
								: "No groups yet"}
						</Text>
					</View>

					{/* Groups List */}
					{groups && groups.length > 0 ? (
						groups.map((group) => (
							<TouchableOpacity
								key={group._id}
								onPress={() => handleSelectGroup(group._id)}
								activeOpacity={0.8}
							>
								<SquircleView
									style={[
										styles.groupCard,
										{
											borderRadius: 24,
											borderColor:
												selectedGroupId === group._id
													? colors.primary
													: colors.border,
											borderWidth: selectedGroupId === group._id ? 2 : 1,
										},
									]}
									cornerSmoothing={1.0}
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
														"rgba(139, 92, 246, 0.03)",
													]
										}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 1 }}
										style={styles.groupCardGradient}
									>
										<View style={styles.groupCardHeader}>
											<View style={styles.groupCardTitleRow}>
												<View
													style={[
														styles.groupIcon,
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
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															stroke={colors.primary}
															d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
														/>
													</Svg>
												</View>
												<View style={styles.groupCardTitleText}>
													<Text
														style={[styles.groupName, { color: colors.text }]}
													>
														{group.name}
													</Text>
													<Text
														style={[
															styles.memberCount,
															{ color: colors.textTertiary },
														]}
													>
														{group.memberCount}{" "}
														{group.memberCount === 1 ? "member" : "members"}
													</Text>
												</View>
											</View>
											{selectedGroupId === group._id && (
												<View
													style={[
														styles.selectedBadge,
														{ backgroundColor: colors.primary },
													]}
												>
													<Text style={styles.selectedBadgeText}>Active</Text>
												</View>
											)}
										</View>

										<View style={styles.groupStatsRow}>
											<View style={styles.groupStatItem}>
												<Text
													style={[styles.statValue, { color: colors.primary }]}
												>
													{group.groupStreak}
												</Text>
												<Text
													style={[
														styles.statLabel,
														{ color: colors.textSecondary },
													]}
												>
													Streak 🔥
												</Text>
											</View>
											<View
												style={[
													styles.statDivider,
													{ backgroundColor: colors.border },
												]}
											/>
											<View style={styles.groupStatItem}>
												<Text
													style={[styles.statValue, { color: colors.text }]}
												>
													{group.memberCount}
												</Text>
												<Text
													style={[
														styles.statLabel,
														{ color: colors.textSecondary },
													]}
												>
													Members
												</Text>
											</View>
										</View>
									</LinearGradient>
								</SquircleView>
							</TouchableOpacity>
						))
					) : (
						<View
							style={[
								styles.emptyCard,
								{
									borderColor: colors.border,
									backgroundColor: "transparent",
								},
							]}
						>
							<View style={styles.emptyContent}>
								<Text style={[styles.emptyEmoji]}>👥</Text>
								<Text
									style={[styles.emptyTitle, { color: colors.textSecondary }]}
								>
									No Groups Yet
								</Text>
								<Text
									style={[styles.emptySubtitle, { color: colors.textTertiary }]}
								>
									Create or join a group to stay accountable with friends
								</Text>
							</View>
						</View>
					)}

					{/* Quick Actions */}
					<View style={styles.actionsContainer}>
						<Button
							title="Create New Group"
							onPress={handleCreateGroup}
							fullWidth
							size="large"
							style={styles.primaryButton}
						/>
						<Button
							title="Join Existing Group"
							onPress={handleJoinGroup}
							variant="outline"
							fullWidth
							size="large"
							style={styles.secondaryButton}
						/>
					</View>
				</ScrollView>
			</SafeAreaView>
		</ScreenTransition>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: Theme.spacing.lg,
		paddingTop: Theme.spacing.lg,
		paddingBottom: Theme.spacing.xxl,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: Theme.spacing.xl,
	},
	loadingImage: {
		width: 200,
		height: 200,
	},
	header: {
		marginBottom: Theme.spacing.lg,
	},
	title: {
		fontSize: 28,
		fontWeight: Theme.typography.fontWeight.bold,
	},
	// Personal Card
	personalCard: {
		marginBottom: Theme.spacing.xl,
		overflow: "hidden",
		shadowColor: "#8B5CF6",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 6,
	},
	personalCardGradient: {
		padding: Theme.spacing.lg,
	},
	personalCardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: Theme.spacing.lg,
	},
	personalCardTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Theme.spacing.md,
	},
	personalIcon: {
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: "center",
		alignItems: "center",
	},
	personalCardTitleText: {
		flex: 1,
	},
	personalCardTitle: {
		fontSize: Theme.typography.fontSize.xl,
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: 2,
	},
	personalCardSubtitle: {
		fontSize: Theme.typography.fontSize.sm,
	},
	selectedBadge: {
		paddingHorizontal: Theme.spacing.sm,
		paddingVertical: Theme.spacing.xs,
		borderRadius: Theme.borderRadius.full,
	},
	selectedBadgeText: {
		color: "#FFFFFF",
		fontSize: Theme.typography.fontSize.xs,
		fontWeight: Theme.typography.fontWeight.semibold,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	statsRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
	},
	statItem: {
		alignItems: "center",
		flex: 1,
	},
	statValue: {
		fontSize: 28,
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: 2,
	},
	statLabel: {
		fontSize: Theme.typography.fontSize.xs,
		fontWeight: Theme.typography.fontWeight.medium,
	},
	statDivider: {
		width: 1,
		height: 40,
	},
	groupStatsRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
	},
	groupStatItem: {
		alignItems: "center",
		flex: 1,
	},
	// Section Header
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "baseline",
		marginBottom: Theme.spacing.md,
	},
	sectionTitle: {
		fontSize: Theme.typography.fontSize.lg,
		fontWeight: Theme.typography.fontWeight.semibold,
	},
	sectionSubtitle: {
		fontSize: Theme.typography.fontSize.sm,
	},
	// Group Cards
	groupCard: {
		marginBottom: Theme.spacing.md,
		overflow: "hidden",
		shadowColor: "#8B5CF6",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 6,
	},
	groupCardGradient: {
		padding: Theme.spacing.lg,
	},
	groupCardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: Theme.spacing.md,
	},
	groupCardTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Theme.spacing.md,
		flex: 1,
	},
	groupIcon: {
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: "center",
		alignItems: "center",
	},
	groupCardTitleText: {
		flex: 1,
	},
	groupName: {
		fontSize: Theme.typography.fontSize.lg,
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: 2,
	},
	memberCount: {
		fontSize: Theme.typography.fontSize.sm,
	},
	// Empty State
	emptyCard: {
		marginBottom: Theme.spacing.md,
		borderWidth: 1,
		borderStyle: "dashed",
		borderRadius: Theme.borderRadius.lg,
		padding: Theme.spacing.xl,
	},
	emptyContent: {
		alignItems: "center",
	},
	emptyEmoji: {
		fontSize: 40,
		marginBottom: Theme.spacing.sm,
	},
	emptyTitle: {
		fontSize: Theme.typography.fontSize.base,
		fontWeight: Theme.typography.fontWeight.medium,
		marginBottom: Theme.spacing.xs,
	},
	emptySubtitle: {
		fontSize: Theme.typography.fontSize.sm,
		textAlign: "center",
		lineHeight: 20,
	},
	// Actions
	actionsContainer: {
		marginTop: Theme.spacing.lg,
		gap: Theme.spacing.md,
	},
	primaryButton: {
		marginBottom: 0,
	},
	secondaryButton: {
		marginBottom: 0,
	},
});
