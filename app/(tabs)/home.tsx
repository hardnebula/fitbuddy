import React, { useState, useMemo, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	StatusBar,
	Alert,
	Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { ScreenTransition } from "@/components/ScreenTransition";
import { GroupHeader } from "@/components/GroupHeader";
import { HeroCard } from "@/components/HeroCard";
import { StreakHero } from "@/components/StreakHero";
import { StreakSection } from "@/components/StreakSection";
import { PersonalFeed } from "@/components/PersonalFeed";
import { UserGroupActivity } from "@/components/UserGroupActivity";
import { CheckInModal } from "@/components/CheckInModal";
import { GroupSelectorModal } from "@/components/GroupSelectorModal";
import { StoryModal } from "@/components/StoryModal";
import { EmptyState } from "@/components/EmptyState";
import SquircleView from "@/components/SquircleView";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { Theme } from "@/constants/Theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserGroups } from "@/lib/groups";
import {
	useGroupCheckIns,
	useUserCheckIns,
	useCheckIns,
	useHasCheckedInToday,
} from "@/lib/checkIns";
import { useGroupSelection } from "@/hooks/useGroupSelection";
import { Id } from "@/convex/_generated/dataModel";
import { CheckIn } from "@/types";
import {
	getLocalCheckIns,
	saveLocalCheckIn,
	getLocalUserStats,
	hasCheckedInTodayLocal,
	LocalCheckIn,
} from "@/lib/localCheckIns";

export default function HomeScreen() {
	const { colors, isDark } = useTheme();
	const { userId, user, isLoading: authLoading } = useAuthContext();
	const router = useRouter();

	// Fetch user's groups from Convex
	const groups = useUserGroups(userId);

	// Group selection logic
	const {
		selectedGroup,
		selectedGroupId,
		setSelectedGroupId,
		isLoading: groupSelectionLoading,
	} = useGroupSelection(groups);

	// UI state (only modal visibility and group image)
	const [showCheckInModal, setShowCheckInModal] = useState(false);
	const [showGroupSelector, setShowGroupSelector] = useState(false);
	const [groupImage, setGroupImage] = useState<string | null>(null);
	const [selectedStory, setSelectedStory] = useState<CheckIn | null>(null);
	const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);

	// Local check-ins state (for anonymous users)
	const [localCheckIns, setLocalCheckIns] = useState<LocalCheckIn[]>([]);
	const [localStats, setLocalStats] = useState<{
		currentStreak: number;
		bestStreak: number;
		totalCheckIns: number;
		lastCheckIn?: number;
	}>({
		currentStreak: 0,
		bestStreak: 0,
		totalCheckIns: 0,
		lastCheckIn: undefined,
	});
	const [localHasCheckedInToday, setLocalHasCheckedInToday] = useState(false);

	// Fetch check-ins - use group check-ins if group selected, otherwise user's personal check-ins
	// If not logged in, use local check-ins
	const groupCheckInsData = useGroupCheckIns(selectedGroup?._id || null);
	const userCheckInsData = useUserCheckIns(userId);
	const serverCheckInsData = selectedGroup
		? groupCheckInsData
		: userCheckInsData;

	// Check if user has checked in today (server or local)
	const serverHasCheckedInToday = useHasCheckedInToday(userId);
	const hasCheckedInToday = userId
		? serverHasCheckedInToday
		: localHasCheckedInToday;

	// Check-in mutations
	const { createCheckIn } = useCheckIns();

	// Load local check-ins when not logged in
	const loadLocalData = async () => {
		const [checkIns, stats, hasCheckedIn] = await Promise.all([
			getLocalCheckIns(),
			getLocalUserStats(),
			hasCheckedInTodayLocal(),
		]);
		setLocalCheckIns(checkIns.filter((ci) => !ci.isSynced));
		setLocalStats(stats);
		setLocalHasCheckedInToday(hasCheckedIn);
	};

	// Refresh handler that works for both local and server check-ins
	const handleRefresh = async () => {
		if (!userId) {
			// For local users, reload local data
			await loadLocalData();
		}
		// For logged-in users, Convex queries will automatically update via reactivity
		// But we can force a refresh by invalidating queries if needed
	};

	useEffect(() => {
		if (!userId) {
			loadLocalData();
		}
	}, [userId]);

	// Transform check-ins to CheckIn format (server or local)
	const checkIns: CheckIn[] = useMemo(() => {
		if (!userId) {
			// Use local check-ins for anonymous users
			return localCheckIns.map((checkIn) => ({
				id: checkIn.id,
				userId: checkIn.userId || "local",
				userName: "You",
				userAvatar: undefined,
				timestamp: new Date(checkIn.timestamp),
				photo: checkIn.photo || undefined,
				note: checkIn.note || undefined,
			}));
		}

		// Use server check-ins for logged-in users
		if (!serverCheckInsData) return [];

		return serverCheckInsData.map((checkIn) => ({
			id: checkIn._id,
			userId: checkIn.userId,
			userName: checkIn.userName || "Unknown",
			userAvatar: checkIn.userAvatar,
			timestamp: new Date(checkIn.timestamp),
			photo: checkIn.photo,
			note: checkIn.note,
		}));
	}, [userId, serverCheckInsData, localCheckIns]);

	// Get group member count
	const memberCount = useMemo(() => {
		// TODO: Fetch group members when needed
		// For now, return undefined to hide the count
		return undefined;
	}, [selectedGroup]);

	// Format last check-in time (server or local)
	const lastCheckIn = useMemo(() => {
		const lastCheckInTimestamp = userId
			? user?.lastCheckIn
			: localStats.lastCheckIn;
		if (!lastCheckInTimestamp) return undefined;

		const lastCheckInDate = new Date(lastCheckInTimestamp);
		const now = new Date();
		const diffInHours = Math.floor(
			(now.getTime() - lastCheckInDate.getTime()) / (1000 * 60 * 60)
		);

		if (diffInHours < 24) {
			return lastCheckInDate.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});
		}

		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays === 1) {
			return "Yesterday";
		}

		return `${diffInDays} days ago`;
	}, [userId, user?.lastCheckIn, localStats.lastCheckIn]);

	const handleSelectGroupImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets && result.assets.length > 0) {
			setGroupImage(result.assets[0].uri);
		}
	};

	const handleCheckInSubmit = async (data: {
		note: string;
		photo: string | null;
		groupIds: Id<"groups">[];
	}) => {
		if (isSubmittingCheckIn) return; // Prevent double submission

		setIsSubmittingCheckIn(true);
		try {
			// If not logged in, save locally
			if (!userId) {
				await saveLocalCheckIn({
					userId: null,
					groupId: data.groupIds.length > 0 ? data.groupIds[0] : null,
					timestamp: Date.now(),
					photo: data.photo || null,
					note: data.note || null,
				});

				setShowCheckInModal(false);
				await loadLocalData(); // Refresh local data
				Alert.alert("Success!", "Check-in saved locally! 🔥", [{ text: "OK" }]);
				return;
			}

			// If no groups selected, create a personal check-in (no groupId)
			if (data.groupIds.length === 0) {
				await createCheckIn({
					userId,
					groupId: undefined,
					note: data.note || undefined,
					photo: data.photo || undefined,
				});

				setShowCheckInModal(false);
				Alert.alert("Success!", "Check-in saved! 🔥", [{ text: "OK" }]);
				return;
			}

			// Create check-ins for each selected group
			await Promise.all(
				data.groupIds.map((groupId) =>
					createCheckIn({
						userId,
						groupId,
						note: data.note || undefined,
						photo: data.photo || undefined,
					})
				)
			);

			setShowCheckInModal(false);

			const groupText =
				data.groupIds.length === groups?.length
					? "all groups"
					: data.groupIds.length === 1
						? groups?.find((g) => g._id === data.groupIds[0])?.name
						: `${data.groupIds.length} groups`;

			Alert.alert("Success!", `Check-in shared with ${groupText}! 🔥`, [
				{ text: "OK" },
			]);
		} catch (error: any) {
			Alert.alert(
				"Error",
				error.message || "Failed to create check-in. Please try again."
			);
		} finally {
			setIsSubmittingCheckIn(false);
		}
	};

	// Show loading state if auth is still loading
	if (authLoading) {
		return (
			<ScreenTransition>
				<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
				<SafeAreaView
					style={[styles.container, { backgroundColor: colors.background }]}
					edges={["top"]}
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

	// Show loading state if we have userId but groups are still loading
	if (userId && groups === undefined) {
		return (
			<ScreenTransition>
				<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
				<SafeAreaView
					style={[styles.container, { backgroundColor: colors.background }]}
					edges={["top"]}
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

	// Allow anonymous usage - no need to show empty state

	// If no groups, show personal view (no group header, but allow check-ins)
	const hasGroups = groups && groups.length > 0;

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
					contentInsetAdjustmentBehavior="automatic"
				>
					{/* Header - show if user has groups (even in personal mode) - Moved to top */}
					{hasGroups && (
						<GroupHeader
							group={selectedGroup}
							memberCount={memberCount}
							groupImage={groupImage}
							onMenuPress={() => setShowGroupSelector(true)}
						/>
					)}

					{/* Streak Hero */}
					<StreakHero
						streak={
							userId ? user?.currentStreak || 0 : localStats.currentStreak
						}
						bestStreak={userId ? user?.bestStreak : localStats.bestStreak}
					/>

					{/* Hero Card */}
					<HeroCard
						hasCheckedInToday={hasCheckedInToday || false}
						lastCheckIn={lastCheckIn}
						onCheckInPress={() => setShowCheckInModal(true)}
					/>

					{/* Group Streak Section - Only show if user has groups */}
					{hasGroups && selectedGroup && selectedGroup.groupStreak > 0 && (
						<StreakSection
							userStreak={
								userId ? user?.currentStreak || 0 : localStats.currentStreak
							}
							groupStreak={selectedGroup.groupStreak}
						/>
					)}

					{/* Feed - show personal feed if Personal mode selected or no groups, otherwise user group activity */}
					{hasGroups && selectedGroupId !== null ? (
						<>
							<UserGroupActivity
								checkIns={checkIns}
								userId={userId}
								totalCheckIns={
									userId ? user?.totalCheckIns || 0 : localStats.totalCheckIns
								}
								bestStreak={
									userId ? user?.bestStreak || 0 : localStats.bestStreak
								}
								onCheckInPress={(checkIn) => setSelectedStory(checkIn)}
								onRefresh={handleRefresh}
							/>

							{/* Leaderboard Card - Coming Soon */}
							<View style={styles.leaderboardSection}>
								<SquircleView
									style={[
										styles.leaderboardCard,
										{
											borderColor: colors.border,
											borderWidth: 1,
											opacity: 0.5,
										},
									]}
									cornerSmoothing={1.0}
								>
									<LinearGradient
										colors={
											isDark
												? [
														"rgba(139, 92, 246, 0.08)",
														"rgba(139, 92, 246, 0.03)",
													]
												: [
														"rgba(139, 92, 246, 0.05)",
														"rgba(139, 92, 246, 0.02)",
													]
										}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 1 }}
										style={styles.leaderboardGradient}
									>
										<View style={styles.leaderboardContent}>
											<View
												style={[
													styles.leaderboardIcon,
													{ backgroundColor: colors.primary + "15" },
												]}
											>
												<Svg
													width={24}
													height={24}
													viewBox="0 0 24 24"
													fill="none"
												>
													<Path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														stroke={colors.primary}
														d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
													/>
												</Svg>
											</View>
											<View style={styles.leaderboardText}>
												<Text
													style={[
														styles.leaderboardTitle,
														{ color: colors.text },
													]}
												>
													Leaderboard
												</Text>
												<Text
													style={[
														styles.leaderboardSubtext,
														{ color: colors.textSecondary },
													]}
												>
													Coming soon
												</Text>
											</View>
										</View>
									</LinearGradient>
								</SquircleView>
							</View>
						</>
					) : (
						<PersonalFeed
							checkIns={checkIns}
							totalCheckIns={
								userId ? user?.totalCheckIns || 0 : localStats.totalCheckIns
							}
							bestStreak={
								userId ? user?.bestStreak || 0 : localStats.bestStreak
							}
							onCheckInPress={(checkIn) => setSelectedStory(checkIn)}
							onRefresh={handleRefresh}
						/>
					)}
				</ScrollView>

				{/* Group Selector Modal */}
				{hasGroups && (
					<GroupSelectorModal
						visible={showGroupSelector}
						groups={groups}
						selectedGroupId={selectedGroup?._id || null}
						onClose={() => setShowGroupSelector(false)}
						onSelectGroup={(groupId) => {
							setSelectedGroupId(groupId);
						}}
					/>
				)}

				{/* Check-in Modal */}
				<CheckInModal
					visible={showCheckInModal}
					groups={groups || []}
					onClose={() => {
						setShowCheckInModal(false);
						setIsSubmittingCheckIn(false); // Reset loading state when modal closes
					}}
					onSubmit={handleCheckInSubmit}
					loading={isSubmittingCheckIn}
				/>

				{/* Story Modal */}
				{selectedStory && (
					<StoryModal
						visible={!!selectedStory}
						onClose={() => setSelectedStory(null)}
						userName={selectedStory.userName}
						userPhoto={selectedStory.userAvatar}
						photo={selectedStory.photo}
						note={selectedStory.note}
						timestamp={selectedStory.timestamp}
					/>
				)}
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
		paddingTop: Theme.spacing.md,
		paddingBottom: Theme.spacing.xl,
		flexGrow: 1,
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
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	leaderboardSection: {
		marginTop: Theme.spacing.xl,
		marginBottom: Theme.spacing.md,
	},
	leaderboardCard: {
		overflow: "hidden",
		borderRadius: 24,
	},
	leaderboardGradient: {
		padding: Theme.spacing.lg,
	},
	leaderboardContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: Theme.spacing.md,
	},
	leaderboardIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
	},
	leaderboardText: {
		flex: 1,
	},
	leaderboardTitle: {
		fontSize: Theme.typography.fontSize.lg,
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: 2,
	},
	leaderboardSubtext: {
		fontSize: Theme.typography.fontSize.sm,
	},
});
