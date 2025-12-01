import React, { useState, useMemo, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Image,
	Alert,
	StatusBar,
	Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScreenTransition } from "@/components/ScreenTransition";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { BadgeCard } from "@/components/BadgeCard";
import { Button as AppButton } from "@/components/Button";
import SquircleView from "@/components/SquircleView";
import { BottomSheet } from "@/components/BottomSheet";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import { Theme } from "@/constants/Theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserStats, useCheckInsByDateRange } from "@/lib/checkIns";

// Check if we're in Expo Go (where custom native modules don't work)
// Expo Go has executionEnvironment === 'storeClient'
const isExpoGo = Constants.executionEnvironment === "storeClient";

// Type definitions for Swift UI components
// Based on @expo/ui/swift-ui package structure
type SwiftUIContextMenuProps = {
	children: React.ReactNode;
};

type SwiftUIContextMenuItemsProps = {
	children: React.ReactNode;
};

type SwiftUIContextMenuTriggerProps = {
	children: React.ReactNode;
};

type SwiftUIContextMenuComponent =
	React.ComponentType<SwiftUIContextMenuProps> & {
		Items: React.ComponentType<SwiftUIContextMenuItemsProps>;
		Trigger: React.ComponentType<SwiftUIContextMenuTriggerProps>;
	};

type SwiftUIHostProps = {
	style?: React.ComponentProps<typeof View>["style"];
	children?: React.ReactNode;
};

type SwiftUIButtonProps = {
	systemImage?: string;
	onPress?: () => void;
	children?: React.ReactNode;
};

type SwiftUIComponents = {
	ContextMenu: SwiftUIContextMenuComponent;
	Host: React.ComponentType<SwiftUIHostProps>;
	Button: React.ComponentType<SwiftUIButtonProps>;
};

// Type definitions for Jetpack Compose components
// Based on @expo/ui/jetpack-compose package structure
type JetpackComposeContextMenuProps = {
	children: React.ReactNode;
};

type JetpackComposeContextMenuItemsProps = {
	children: React.ReactNode;
};

type JetpackComposeContextMenuTriggerProps = {
	children: React.ReactNode;
};

type JetpackComposeContextMenuComponent =
	React.ComponentType<JetpackComposeContextMenuProps> & {
		Items: React.ComponentType<JetpackComposeContextMenuItemsProps>;
		Trigger: React.ComponentType<JetpackComposeContextMenuTriggerProps>;
	};

type JetpackComposeHostProps = {
	style?: React.ComponentProps<typeof View>["style"];
	children?: React.ReactNode;
};

type JetpackComposeButtonProps = {
	variant?: "bordered" | "filled" | "tonal" | "text";
	onPress?: () => void;
	children?: React.ReactNode;
};

type JetpackComposeComponents = {
	ContextMenu: JetpackComposeContextMenuComponent;
	Host: React.ComponentType<JetpackComposeHostProps>;
	Button: React.ComponentType<JetpackComposeButtonProps>;
};

// Lazy-loaded native UI components
// These are loaded conditionally at runtime to avoid errors in Expo Go
let swiftUIComponents: SwiftUIComponents | null = null;
let jetpackComposeComponents: JetpackComposeComponents | null = null;

/**
 * Attempts to load Swift UI components for iOS.
 * Only loads if not in Expo Go and on iOS platform.
 * @returns Swift UI components module or null if unavailable
 */
function loadSwiftUIComponents(): SwiftUIComponents | null {
	if (isExpoGo || Platform.OS !== "ios") {
		return null;
	}

	if (swiftUIComponents) {
		return swiftUIComponents;
	}

	try {
		const swiftUI = require("@expo/ui/swift-ui");
		swiftUIComponents = {
			ContextMenu: swiftUI.ContextMenu,
			Host: swiftUI.Host,
			Button: swiftUI.Button,
		};
		return swiftUIComponents;
	} catch (e) {
		console.warn("Swift UI not available:", e);
		return null;
	}
}

/**
 * Attempts to load Jetpack Compose components for Android.
 * Only loads if not in Expo Go and on Android platform.
 * @returns Jetpack Compose components module or null if unavailable
 */
function loadJetpackComposeComponents(): JetpackComposeComponents | null {
	if (isExpoGo || Platform.OS !== "android") {
		return null;
	}

	if (jetpackComposeComponents) {
		return jetpackComposeComponents;
	}

	try {
		const jetpackCompose = require("@expo/ui/jetpack-compose");
		jetpackComposeComponents = {
			ContextMenu: jetpackCompose.ContextMenu,
			Host: jetpackCompose.Host,
			Button: jetpackCompose.Button,
		};
		return jetpackComposeComponents;
	} catch (e) {
		console.warn("Jetpack Compose UI not available:", e);
		return null;
	}
}

export default function ProfileScreen() {
	const { colors, isDark, setTheme } = useTheme();
	const router = useRouter();
	const { userId, user } = useAuthContext();
	const [userPhoto, setUserPhoto] = useState<string | null>(null);
	const [selectedBadge, setSelectedBadge] = useState<any>(null);
	const [showMenuSheet, setShowMenuSheet] = useState(false);

	// Initialize user photo from user object if available
	useEffect(() => {
		if (user?.avatar && !userPhoto) {
			setUserPhoto(user.avatar);
		}
	}, [user?.avatar, userPhoto]);

	// Fetch user stats from Convex
	const userStats = useUserStats(userId);

	// Calculate date range for last 12 weeks (84 days)
	const dateRange = useMemo(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const endDate = today.getTime();
		const startDate = new Date(today);
		startDate.setDate(startDate.getDate() - 84); // 12 weeks = 84 days
		startDate.setHours(0, 0, 0, 0);
		return {
			startDate: startDate.getTime(),
			endDate: endDate + 86400000 - 1, // End of today
		};
	}, []);

	// Fetch check-ins for the last 12 weeks (only if logged in)
	const checkInsData = useCheckInsByDateRange(
		userId,
		null, // No group filter for profile
		dateRange.startDate,
		dateRange.endDate
	);

	// Mock data for testing when not logged in
	const MOCK_USER_STATS = {
		currentStreak: 60,
		bestStreak: 60,
		totalCheckIns: 180,
	};

	// Use real stats if available, otherwise use mock data for preview
	const isPreviewMode = !userId;
	const effectiveStats = userStats ?? (isPreviewMode ? MOCK_USER_STATS : null);

	// Get user stats with fallbacks
	const currentStreak = effectiveStats?.currentStreak ?? 0;
	const bestStreak = effectiveStats?.bestStreak ?? 0;
	const totalCheckIns = effectiveStats?.totalCheckIns ?? 0;
	const userName = user?.name ?? (isPreviewMode ? "Preview User" : "User");

	// Shared Gradient Colors matching Home/Streak cards
	const cardGradientColors = isDark
		? (["rgba(139, 92, 246, 0.25)", "rgba(139, 92, 246, 0.1)"] as const)
		: (["rgba(139, 92, 246, 0.2)", "rgba(139, 92, 246, 0.05)"] as const);

	const cardStyle = {
		borderRadius: 24,
		borderColor: colors.primary,
		borderWidth: 1.5,
		shadowColor: "#8B5CF6",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 15,
		elevation: 8,
	};

	// Generate GitHub-style contribution graph from real check-in data (or mock data in preview mode)
	const contributionWeeks = useMemo(() => {
		const weeks: Array<Array<{ intensity: number; date: Date }>> = [];
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Create a map of check-ins by date (day key)
		const checkInsByDay = new Map<number, number>();
		
		if (checkInsData) {
			checkInsData.forEach((checkIn) => {
				const checkInDate = new Date(checkIn.timestamp);
				checkInDate.setHours(0, 0, 0, 0);
				const dayKey = checkInDate.getTime();
				checkInsByDay.set(dayKey, (checkInsByDay.get(dayKey) || 0) + 1);
			});
		} else if (isPreviewMode) {
			// Generate mock check-in data for preview mode
			// Simulate a 45-day streak with varying intensity
			for (let i = 0; i < 60; i++) {
				const date = new Date(today);
				date.setDate(date.getDate() - i);
				date.setHours(0, 0, 0, 0);
				const dayKey = date.getTime();
				
				// Skip some days randomly for variety, but keep recent 45 days mostly filled
				if (i < 45 || Math.random() > 0.6) {
					const intensity = i < 10 ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 4) + 1;
					checkInsByDay.set(dayKey, intensity);
				}
			}
		}

		// Generate 12 weeks of data (7 days per week)
		for (let week = 0; week < 12; week++) {
			const weekData: Array<{ intensity: number; date: Date }> = [];
			for (let day = 0; day < 7; day++) {
				const date = new Date(today);
				date.setDate(date.getDate() - (week * 7 + (6 - day)));
				date.setHours(0, 0, 0, 0);
				const dayKey = date.getTime();

				// Get check-in count for this day
				const checkInCount = checkInsByDay.get(dayKey) || 0;

				// Map check-in count to intensity (0-4)
				// 0 = no check-ins, 1 = 1 check-in, 2 = 2 check-ins, 3 = 3 check-ins, 4 = 4+ check-ins
				const intensity = Math.min(checkInCount, 4);

				weekData.push({
					intensity,
					date,
				});
			}
			weeks.push(weekData);
		}

		return weeks;
	}, [checkInsData, isPreviewMode]);

	// Badge definitions - badges earned by streak days
	const BADGE_DEFINITIONS = [
		{
			id: "day-1",
			days: 1,
			name: "Day 1",
			description: "You started your journey! The first step is always the hardest. 🚀",
			image: require("@/assets/Badges/Day1.png"),
			rarity: "common" as const,
		},
		{
			id: "day-5",
			days: 5,
			name: "Day 5",
			description: "5 days strong! You're building momentum. Keep pushing! 💪",
			image: require("@/assets/Badges/Day5.png"),
			rarity: "common" as const,
		},
		{
			id: "day-10",
			days: 10,
			name: "Day 10",
			description: "Double digits! 10 days of dedication. You're on fire! 🔥",
			image: require("@/assets/Badges/Day10.png"),
			rarity: "rare" as const,
		},
		{
			id: "day-15",
			days: 15,
			name: "Day 15",
			description: "Halfway to a month! 15 days of consistency. Amazing! ⭐",
			image: require("@/assets/Badges/Day15.png"),
			rarity: "rare" as const,
		},
		{
			id: "day-20",
			days: 20,
			name: "Day 20",
			description: "20 days! You're creating a real habit now. Unstoppable! 🌟",
			image: require("@/assets/Badges/Day20.png"),
			rarity: "rare" as const,
		},
		{
			id: "day-25",
			days: 25,
			name: "Day 25",
			description: "25 days of pure dedication! You're almost at a month! 🏆",
			image: require("@/assets/Badges/Day25.png"),
			rarity: "epic" as const,
		},
		{
			id: "day-30",
			days: 30,
			name: "Day 30",
			description: "ONE MONTH! 30 days of commitment. You're a true warrior! ⚔️",
			image: require("@/assets/Badges/Day30.png"),
			rarity: "epic" as const,
		},
		{
			id: "day-35",
			days: 35,
			name: "Day 35",
			description: "35 days! Beyond a month and still going. Incredible! 💎",
			image: require("@/assets/Badges/Day35.png"),
			rarity: "epic" as const,
		},
		{
			id: "day-40",
			days: 40,
			name: "Day 40",
			description: "40 days! This is no longer a habit, it's who you are! 👑",
			image: require("@/assets/Badges/Day40.png"),
			rarity: "legendary" as const,
		},
		{
			id: "day-45",
			days: 45,
			name: "Day 45",
			description: "45 days! You're in the elite league now. Legendary status! 🌈",
			image: require("@/assets/Badges/Day45.png"),
			rarity: "legendary" as const,
		},
		{
			id: "day-50",
			days: 50,
			name: "Day 50",
			description: "HALF A HUNDRED! 50 days of excellence. You're unstoppable! 🎯",
			image: require("@/assets/Badges/Day50.png"),
			rarity: "legendary" as const,
		},
		{
			id: "day-60",
			days: 60,
			name: "Day 60",
			description: "TWO MONTHS! 60 days of absolute dedication. You're a legend! 🏅",
			image: require("@/assets/Badges/Day60.png"),
			rarity: "legendary" as const,
		},
	];

	// Calculate badges dynamically based on user stats (or mock stats in preview mode)
	const badges = useMemo(() => {
		if (!effectiveStats) return [];

		const earnedBadges: Array<{
			id: string;
			name: string;
			description: string;
			image: any;
			earnedDate: Date;
			rarity: "common" | "rare" | "epic" | "legendary";
		}> = [];

		// Check each badge definition against user's best streak
		for (const badgeDef of BADGE_DEFINITIONS) {
			if (effectiveStats.bestStreak >= badgeDef.days) {
				// Estimate earned date: today minus (bestStreak - requiredDays) days
				const estimatedEarnedDate = new Date();
				estimatedEarnedDate.setDate(
					estimatedEarnedDate.getDate() - (effectiveStats.bestStreak - badgeDef.days)
				);

				earnedBadges.push({
					id: badgeDef.id,
					name: badgeDef.name,
					description: badgeDef.description,
					image: badgeDef.image,
					earnedDate: estimatedEarnedDate,
					rarity: badgeDef.rarity,
				});
			}
		}

		// Sort badges by days required (lowest first - Day 1 at top, Day 60 at bottom)
		return earnedBadges.sort((a, b) => {
			const aDays = BADGE_DEFINITIONS.find(d => d.id === a.id)?.days ?? 0;
			const bDays = BADGE_DEFINITIONS.find(d => d.id === b.id)?.days ?? 0;
			return aDays - bDays;
		});
	}, [effectiveStats]);

	const handleChangePhoto = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (status !== "granted") {
			Alert.alert("Permission needed", "Please grant camera roll permissions");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled) {
			setUserPhoto(result.assets[0].uri);
		}
	};

	const handleSettingsPress = () => {
		setShowMenuSheet(false);
		router.push("/(tabs)/settings");
	};

	const handleBillingPress = () => {
		setShowMenuSheet(false);
		Alert.alert("Billing", "Billing management coming soon");
	};

	const handleThemeToggle = () => {
		setShowMenuSheet(false);
		setTheme(isDark ? "light" : "dark");
	};

	// Render context menu based on platform
	const renderContextMenu = () => {
		const cogIcon = (
			<View style={styles.cogButtonContainer}>
				{/* Liquid glass blur effect - iOS/Android only, NOT in Expo Go */}
				{!isExpoGo && (Platform.OS === "ios" || Platform.OS === "android") ? (
					<BlurView
						intensity={Platform.OS === "ios" ? 80 : 50}
						tint={isDark ? "dark" : "light"}
						style={styles.cogBlur}
					/>
				) : (
					/* Fallback background for Expo Go, web, and unsupported platforms */
					<View
						style={[
							styles.cogBlur,
							{
								backgroundColor: isDark
									? "rgba(255, 255, 255, 0.1)"
									: "rgba(255, 255, 255, 0.7)",
							},
						]}
					/>
				)}
				{/* Border for depth */}
				<View
					style={[
						styles.cogBorder,
						{
							borderColor: isDark
								? "rgba(255, 255, 255, 0.15)"
								: "rgba(0, 0, 0, 0.1)",
						},
					]}
				/>
				{/* Icon */}
				<View style={styles.cogIconContainer}>
					<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
						<Path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							stroke={colors.text}
							d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
						/>
						<Path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							stroke={colors.text}
							d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
						/>
					</Svg>
				</View>
			</View>
		);

		// iOS: Use Swift UI ContextMenu (only if available and NOT in Expo Go)
		const swiftUI = loadSwiftUIComponents();
		if (swiftUI) {
			const { ContextMenu, Host, Button } = swiftUI;
			return (
				<Host style={styles.contextMenuHost}>
					<ContextMenu>
						<ContextMenu.Items>
							<Button systemImage="gearshape" onPress={handleSettingsPress}>
								Settings
							</Button>
							<Button systemImage="creditcard" onPress={handleBillingPress}>
								Billing
							</Button>
							<Button
								systemImage={isDark ? "sun.max" : "moon"}
								onPress={handleThemeToggle}
							>
								{isDark ? "Light Mode" : "Dark Mode"}
							</Button>
						</ContextMenu.Items>
						<ContextMenu.Trigger>{cogIcon}</ContextMenu.Trigger>
					</ContextMenu>
				</Host>
			);
		}

		// Android: Use Jetpack Compose ContextMenu (only if available and NOT in Expo Go)
		const jetpackCompose = loadJetpackComposeComponents();
		if (jetpackCompose) {
			const { ContextMenu, Host, Button } = jetpackCompose;
			return (
				<Host style={styles.contextMenuHost}>
					<ContextMenu>
						<ContextMenu.Items>
							<Button onPress={handleSettingsPress}>Settings</Button>
							<Button variant="bordered" onPress={handleBillingPress}>
								Billing
							</Button>
							<Button onPress={handleThemeToggle}>
								{isDark ? "Light Mode" : "Dark Mode"}
							</Button>
						</ContextMenu.Items>
						<ContextMenu.Trigger>{cogIcon}</ContextMenu.Trigger>
					</ContextMenu>
				</Host>
			);
		}

		// Fallback: Use TouchableOpacity with BottomSheet (for Expo Go and web)
		return (
			<>
				<TouchableOpacity
					onPress={() => setShowMenuSheet(true)}
					activeOpacity={0.7}
				>
					{cogIcon}
				</TouchableOpacity>
				<BottomSheet
					visible={showMenuSheet}
					onClose={() => setShowMenuSheet(false)}
					snapPoints={["30%"]}
				>
					<View style={styles.menuSheetContent}>
						<TouchableOpacity
							style={[styles.menuItem, { borderBottomColor: colors.border }]}
							onPress={handleSettingsPress}
							activeOpacity={0.7}
						>
							<Text style={[styles.menuItemText, { color: colors.text }]}>
								Settings
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.menuItem, { borderBottomColor: colors.border }]}
							onPress={handleBillingPress}
							activeOpacity={0.7}
						>
							<Text style={[styles.menuItemText, { color: colors.text }]}>
								Billing
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.menuItem}
							onPress={handleThemeToggle}
							activeOpacity={0.7}
						>
							<Text style={[styles.menuItemText, { color: colors.text }]}>
								{isDark ? "Light Mode" : "Dark Mode"}
							</Text>
						</TouchableOpacity>
					</View>
				</BottomSheet>
			</>
		);
	};

	// Get intensity color based on level (0-4)
	const getIntensityColor = (intensity: number) => {
		if (intensity === 0) return colors.surface;
		if (intensity === 1)
			return isDark ? "rgba(139, 92, 246, 0.2)" : "rgba(139, 92, 246, 0.15)";
		if (intensity === 2)
			return isDark ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.3)";
		if (intensity === 3)
			return isDark ? "rgba(139, 92, 246, 0.6)" : "rgba(139, 92, 246, 0.5)";
		return colors.primary; // intensity === 4
	};

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
				>
					{/* Header */}
					<View style={styles.headerContainer}>
						<AnimatedTitle
							style={StyleSheet.flatten([styles.title, { color: colors.text }])}
						>
							Profile
						</AnimatedTitle>
						{userId && renderContextMenu()}
					</View>

					{/* Sign In Prompt Card - Show when not logged in */}
					{!userId && (
						<SquircleView
							style={[styles.profileCard, cardStyle]}
							cornerSmoothing={1}
						>
							<LinearGradient
								colors={cardGradientColors as any}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.signInCardContent}
							>
								<View style={styles.signInIconContainer}>
									<Text style={styles.signInEmoji}>🔐</Text>
								</View>
								<Text style={[styles.signInTitle, { color: colors.text }]}>
									Sign In to Save & Sync
								</Text>
								<Text
									style={[
										styles.signInSubtitle,
										{ color: colors.textSecondary },
									]}
								>
									Sign in to sync your check-ins across devices and never lose
									your progress
								</Text>
								<View style={styles.signInButtonContainer}>
									<AppButton
										title="Sign In"
										onPress={() => router.push("/(auth)/sign-in")}
										fullWidth
										size="large"
									/>
								</View>
							</LinearGradient>
						</SquircleView>
					)}

					{/* Profile Header Card - Styled like StreakHero - Only show when logged in */}
					{userId && (
						<>
							<SquircleView
								style={[styles.profileCard, cardStyle]}
								cornerSmoothing={1}
							>
								<LinearGradient
									colors={cardGradientColors as any}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 1 }}
									style={styles.profileGradient}
								>
									<TouchableOpacity
										onPress={handleChangePhoto}
										style={styles.avatarWrapper}
									>
										<View
											style={[
												styles.avatar,
												{ backgroundColor: colors.primary },
											]}
										>
											{userPhoto ? (
												<Image
													source={{ uri: userPhoto }}
													style={styles.avatarImage}
												/>
											) : (
												<Text style={styles.avatarEmoji}>👤</Text>
											)}
										</View>
										<View
											style={[
												styles.editBadge,
												{ backgroundColor: colors.card },
											]}
										>
											<Svg
												width={12}
												height={12}
												viewBox="0 0 24 24"
												fill="none"
												stroke={colors.primary}
												strokeWidth={2}
											>
												<Path
													d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</Svg>
										</View>
									</TouchableOpacity>

									<View style={styles.userInfo}>
										<Text style={[styles.userName, { color: colors.text }]}>
											{userName}
										</Text>
										<Text
											style={[
												styles.userSubtitle,
												{ color: colors.textSecondary },
											]}
										>
											{user?.createdAt
												? `Member since ${new Date(
														user.createdAt
													).toLocaleDateString("en-US", {
														month: "long",
														year: "numeric",
													})}`
												: "Member"}
										</Text>
									</View>
								</LinearGradient>
							</SquircleView>

							{/* Stats Row - Consolidated into one card like StreakSection */}
							<SquircleView
								style={[styles.statsContainer, cardStyle]}
								cornerSmoothing={1}
							>
								<LinearGradient
									colors={cardGradientColors as any}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 1 }}
									style={styles.statsGradient}
								>
									<View style={styles.statItem}>
										<Text style={styles.statEmoji}>🔥</Text>
										<Text style={[styles.statValue, { color: colors.primary }]}>
											{currentStreak}
										</Text>
										<Text
											style={[
												styles.statLabel,
												{ color: colors.textSecondary },
											]}
										>
											Current Streak
										</Text>
									</View>

									<View
										style={[
											styles.verticalDivider,
											{
												backgroundColor: isDark
													? "rgba(255,255,255,0.1)"
													: "rgba(0,0,0,0.05)",
											},
										]}
									/>

									<View style={styles.statItem}>
										<Text style={styles.statEmoji}>✅</Text>
										<Text style={[styles.statValue, { color: colors.text }]}>
											{totalCheckIns}
										</Text>
										<Text
											style={[
												styles.statLabel,
												{ color: colors.textSecondary },
											]}
										>
											Total Check-ins
										</Text>
									</View>

									<View
										style={[
											styles.verticalDivider,
											{
												backgroundColor: isDark
													? "rgba(255,255,255,0.1)"
													: "rgba(0,0,0,0.05)",
											},
										]}
									/>

									<View style={styles.statItem}>
										<Text style={styles.statEmoji}>⚡</Text>
										<Text style={[styles.statValue, { color: colors.text }]}>
											{bestStreak}
										</Text>
										<Text
											style={[
												styles.statLabel,
												{ color: colors.textSecondary },
											]}
										>
											Best Streak
										</Text>
									</View>
								</LinearGradient>
							</SquircleView>
						</>
					)}

					{/* Preview Stats Row - Show when not logged in */}
					{isPreviewMode && (
						<SquircleView
							style={[styles.statsContainer, cardStyle]}
							cornerSmoothing={1}
						>
							<LinearGradient
								colors={cardGradientColors as any}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.statsGradient}
							>
								<View style={styles.previewBanner}>
									<Text style={[styles.previewBannerText, { color: colors.primary }]}>
										👀 Preview Mode
									</Text>
								</View>
								<View style={styles.statItem}>
									<Text style={styles.statEmoji}>🔥</Text>
									<Text style={[styles.statValue, { color: colors.primary }]}>
										{currentStreak}
									</Text>
									<Text
										style={[
											styles.statLabel,
											{ color: colors.textSecondary },
										]}
									>
										Current Streak
									</Text>
								</View>

								<View
									style={[
										styles.verticalDivider,
										{
											backgroundColor: isDark
												? "rgba(255,255,255,0.1)"
												: "rgba(0,0,0,0.05)",
										},
									]}
								/>

								<View style={styles.statItem}>
									<Text style={styles.statEmoji}>✅</Text>
									<Text style={[styles.statValue, { color: colors.text }]}>
										{totalCheckIns}
									</Text>
									<Text
										style={[
											styles.statLabel,
											{ color: colors.textSecondary },
										]}
									>
										Total Check-ins
									</Text>
								</View>

								<View
									style={[
										styles.verticalDivider,
										{
											backgroundColor: isDark
												? "rgba(255,255,255,0.1)"
												: "rgba(0,0,0,0.05)",
										},
									]}
								/>

								<View style={styles.statItem}>
									<Text style={styles.statEmoji}>⚡</Text>
									<Text style={[styles.statValue, { color: colors.text }]}>
										{bestStreak}
									</Text>
									<Text
										style={[
											styles.statLabel,
											{ color: colors.textSecondary },
										]}
									>
										Best Streak
									</Text>
								</View>
							</LinearGradient>
						</SquircleView>
					)}

					{/* Activity Graph Section - GitHub Style - Always visible */}
					<View style={styles.sectionContainer}>
						<View style={styles.sectionHeader}>
							<Text style={[styles.sectionTitle, { color: colors.text }]}>
								Activity Overview
							</Text>
							<Text
								style={[
									styles.sectionSubtitle,
									{ color: colors.textSecondary },
								]}
							>
								Last 12 weeks {isPreviewMode && "(Preview)"}
							</Text>
						</View>
						<SquircleView
							style={[styles.activityCard, cardStyle]}
							cornerSmoothing={1}
						>
							<LinearGradient
								colors={cardGradientColors as any}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.activityGradient}
							>
								<View style={styles.contributionGraph}>
									{/* Day labels (Sun-Sat) */}
									<View style={styles.dayLabels}>
										{["S", "M", "T", "W", "T", "F", "S"].map(
											(day, index) => (
												<Text
													key={index}
													style={[
														styles.dayLabel,
														{ color: colors.textTertiary },
													]}
												>
													{day}
												</Text>
											)
										)}
									</View>

									{/* Contribution grid */}
									<View style={styles.contributionGrid}>
										{contributionWeeks.map((week, weekIndex) => (
											<View key={weekIndex} style={styles.weekColumn}>
												{week.map((day, dayIndex) => {
													const isToday =
														day.date.toDateString() ===
														new Date().toDateString();
													const intensityColor = getIntensityColor(
														day.intensity
													);

													return (
														<SquircleView
															key={dayIndex}
															style={[
																styles.contributionCell,
																{
																	backgroundColor: intensityColor,
																},
																isToday
																	? {
																			borderWidth: 2,
																			borderColor: colors.primary,
																		}
																	: {},
															]}
															cornerSmoothing={1.0}
														>
															<View />
														</SquircleView>
													);
												})}
											</View>
										))}
									</View>

									{/* Legend */}
									<View style={styles.legend}>
										<Text
											style={[
												styles.legendLabel,
												{ color: colors.textSecondary },
											]}
										>
											Less
										</Text>
										<View style={styles.legendCells}>
											{[0, 1, 2, 3, 4].map((intensity) => (
												<SquircleView
													key={intensity}
													style={[
														styles.legendCell,
														{
															backgroundColor: getIntensityColor(intensity),
														},
													]}
													cornerSmoothing={1.0}
												>
													<View />
												</SquircleView>
											))}
										</View>
										<Text
											style={[
												styles.legendLabel,
												{ color: colors.textSecondary },
											]}
										>
											More
										</Text>
									</View>
								</View>
							</LinearGradient>
						</SquircleView>
					</View>

					{/* Badges Section - Always visible */}
					<View style={styles.sectionContainer}>
						<View style={styles.sectionHeader}>
							<Text style={[styles.sectionTitle, { color: colors.text }]}>
								Achievements {isPreviewMode && "(Preview)"}
							</Text>
						</View>
						{badges.length > 0 ? (
							<View style={styles.badgesContainer}>
								{badges.map((badge) => {
									const rarityShadow = {
										common: "rgba(107, 114, 128, 0.5)",
										rare: "rgba(59, 130, 246, 0.5)",
										epic: "rgba(168, 85, 247, 0.5)",
										legendary: "rgba(245, 158, 11, 0.6)",
									};
									return (
										<TouchableOpacity
											key={badge.id}
											style={[
												styles.badgeCardWrapper,
												{ shadowColor: rarityShadow[badge.rarity] },
											]}
											onPress={() => setSelectedBadge(badge)}
											activeOpacity={0.9}
										>
											<Image
												source={badge.image}
												style={styles.badgeImage}
												resizeMode="cover"
											/>
										</TouchableOpacity>
									);
								})}
							</View>
						) : (
							<View style={styles.emptyBadgesContainer}>
								<Text
									style={[
										styles.emptyBadgesText,
										{ color: colors.textSecondary },
									]}
								>
									🏆 No achievements yet
								</Text>
								<Text
									style={[
										styles.emptyBadgesSubtext,
										{ color: colors.textTertiary },
									]}
								>
									Keep checking in to earn badges!
								</Text>
							</View>
						)}
					</View>

					{/* Badge Card Modal - Always available */}
					{selectedBadge && (
						<BadgeCard
							visible={!!selectedBadge}
							onClose={() => setSelectedBadge(null)}
							badge={selectedBadge}
						/>
					)}
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
		paddingBottom: Theme.spacing.xl * 2,
	},
	headerContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: Theme.spacing.lg,
	},
	title: {
		fontSize: 28,
		fontWeight: Theme.typography.fontWeight.bold,
	},
	themeToggle: {
		width: 44,
		height: 44,
		justifyContent: "center",
		alignItems: "center",
	},
	cogButtonContainer: {
		width: 44,
		height: 44,
		borderRadius: 22,
		overflow: "hidden",
		position: "relative",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	cogBlur: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 22,
	},
	cogBorder: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 22,
		borderWidth: 1,
		zIndex: 1,
	},
	cogIconContainer: {
		width: 44,
		height: 44,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 2,
	},
	contextMenuHost: {
		width: 44,
		height: 44,
	},
	menuSheetContent: {
		padding: Theme.spacing.lg,
	},
	menuItem: {
		paddingVertical: Theme.spacing.md,
		borderBottomWidth: 1,
	},
	menuItemText: {
		fontSize: Theme.typography.fontSize.base,
		fontWeight: Theme.typography.fontWeight.medium,
	},
	profileCard: {
		marginBottom: Theme.spacing.xl,
		overflow: "hidden",
	},
	signInCardContent: {
		padding: Theme.spacing.xl,
		alignItems: "center",
	},
	signInIconContainer: {
		marginBottom: Theme.spacing.md,
	},
	signInEmoji: {
		fontSize: 48,
	},
	signInTitle: {
		fontSize: Theme.typography.fontSize.xl,
		fontWeight: Theme.typography.fontWeight.bold,
		textAlign: "center",
		marginBottom: Theme.spacing.sm,
	},
	signInSubtitle: {
		fontSize: Theme.typography.fontSize.base,
		textAlign: "center",
		marginBottom: Theme.spacing.lg,
		lineHeight: 20,
	},
	signInButtonContainer: {
		width: "100%",
		marginTop: Theme.spacing.sm,
	},
	profileGradient: {
		padding: Theme.spacing.lg,
		flexDirection: "row",
		alignItems: "center",
		gap: Theme.spacing.md,
	},
	avatarWrapper: {
		position: "relative",
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarImage: {
		width: 80,
		height: 80,
		borderRadius: 40,
	},
	avatarEmoji: {
		fontSize: 40,
	},
	editBadge: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: "#FFFFFF",
	},
	userInfo: {
		flex: 1,
	},
	userName: {
		fontSize: Theme.typography.fontSize.xl,
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: 4,
	},
	userSubtitle: {
		fontSize: Theme.typography.fontSize.sm,
	},
	statsContainer: {
		marginBottom: Theme.spacing.xl,
		overflow: "hidden",
	},
	statsGradient: {
		flexDirection: "row",
		flexWrap: "wrap",
		padding: Theme.spacing.lg,
		alignItems: "center",
	},
	previewBanner: {
		width: "100%",
		alignItems: "center",
		marginBottom: Theme.spacing.sm,
	},
	previewBannerText: {
		fontSize: Theme.typography.fontSize.sm,
		fontWeight: Theme.typography.fontWeight.bold,
	},
	statItem: {
		flex: 1,
		alignItems: "center",
	},
	verticalDivider: {
		width: 1,
		height: "80%",
		marginHorizontal: Theme.spacing.xs,
	},
	statEmoji: {
		fontSize: 24,
		marginBottom: 4,
	},
	statValue: {
		fontSize: 24,
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: 2,
	},
	statLabel: {
		fontSize: 11,
		textAlign: "center",
		fontWeight: Theme.typography.fontWeight.medium,
	},
	sectionContainer: {
		marginBottom: Theme.spacing.xl,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: Theme.spacing.md,
	},
	sectionTitle: {
		fontSize: Theme.typography.fontSize.lg,
		fontWeight: Theme.typography.fontWeight.bold,
	},
	sectionSubtitle: {
		fontSize: Theme.typography.fontSize.sm,
		marginLeft: Theme.spacing.sm,
	},
	activityCard: {
		marginBottom: Theme.spacing.xl,
		overflow: "hidden",
	},
	activityGradient: {
		padding: Theme.spacing.md,
		paddingHorizontal: Theme.spacing.sm,
	},
	contributionGraph: {
		width: "100%",
		alignItems: "flex-start",
	},
	dayLabels: {
		flexDirection: "row",
		marginBottom: Theme.spacing.xs,
		marginLeft: 20,
		width: "100%",
		justifyContent: "space-between",
		paddingRight: Theme.spacing.sm,
	},
	dayLabel: {
		fontSize: 10,
		fontWeight: Theme.typography.fontWeight.medium,
		textAlign: "center",
		flex: 1,
	},
	contributionGrid: {
		flexDirection: "row",
		gap: 2,
		marginBottom: Theme.spacing.md,
		width: "100%",
		justifyContent: "space-between",
		paddingHorizontal: Theme.spacing.xs,
	},
	weekColumn: {
		flexDirection: "column",
		gap: 2,
		flex: 1,
		alignItems: "center",
	},
	contributionCell: {
		width: "100%",
		aspectRatio: 1,
		minWidth: 14,
		minHeight: 14,
	},
	legend: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Theme.spacing.sm,
		marginTop: Theme.spacing.sm,
	},
	legendLabel: {
		fontSize: 10,
		fontWeight: Theme.typography.fontWeight.medium,
	},
	legendCells: {
		flexDirection: "row",
		gap: 3,
	},
	legendCell: {
		width: 14,
		height: 14,
	},
	badgesContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "flex-start",
		gap: 10,
	},
	emptyBadgesContainer: {
		paddingVertical: Theme.spacing.xl,
		alignItems: "center",
	},
	emptyBadgesText: {
		fontSize: Theme.typography.fontSize.lg,
		fontWeight: Theme.typography.fontWeight.semibold,
		marginBottom: Theme.spacing.xs,
	},
	emptyBadgesSubtext: {
		fontSize: Theme.typography.fontSize.sm,
		textAlign: "center",
	},
	badgeCardWrapper: {
		width: 100,
		height: 140,
		borderRadius: 10,
		overflow: "hidden",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 10,
		elevation: 8,
	},
	badgeImage: {
		width: 100,
		height: 140,
	},
});
