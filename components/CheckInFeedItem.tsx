import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	Platform,
	Alert,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import SquircleView from "@/components/SquircleView";
import { Theme } from "@/constants/Theme";
import { useTheme } from "@/contexts/ThemeContext";
import { CheckIn } from "@/types";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCheckIns } from "@/lib/checkIns";
import { Id } from "@/convex/_generated/dataModel";
import { CheckInActionsBottomSheet } from "@/components/CheckInActionsBottomSheet";
import { deleteLocalCheckIn } from "@/lib/localCheckIns";

// Try to import MenuView, fallback to null if not available (Expo Go)
let MenuView: any = null;
let isMenuViewActuallyAvailable = false;
try {
	const menuModule = require("@react-native-menu/menu");
	MenuView = menuModule.MenuView;
	// Check if MenuView is actually a valid component (not just imported)
	if (MenuView && typeof MenuView === "function") {
		isMenuViewActuallyAvailable = true;
	}
} catch (e) {
	// MenuView not available (likely Expo Go)
	MenuView = null;
	isMenuViewActuallyAvailable = false;
}

interface CheckInFeedItemProps {
	checkIn: CheckIn;
	onPress?: () => void;
	onDeleted?: () => void;
	onEdited?: () => void;
}

// Generate consistent color from name
function getAvatarColor(name: string): string {
	const colors = [
		"#8B5CF6",
		"#EC4899",
		"#F59E0B",
		"#10B981",
		"#3B82F6",
		"#EF4444",
		"#06B6D4",
		"#84CC16",
	];
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return colors[Math.abs(hash) % colors.length];
}

export function CheckInFeedItem({
	checkIn,
	onPress,
	onDeleted,
	onEdited,
}: CheckInFeedItemProps) {
	const { colors, isDark } = useTheme();
	const { userId } = useAuthContext();
	const { archiveCheckIn } = useCheckIns();
	const [liked, setLiked] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [showActions, setShowActions] = useState(false);

	// Animation values
	const scale = useSharedValue(1);
	const heartScale = useSharedValue(1);

	// Check if this is the user's own check-in
	const checkInUserId = checkIn.userId ? String(checkIn.userId).trim() : "";
	const currentUserId = userId ? String(userId).trim() : "";

	// A check-in is "own" if:
	// 1. It's a local check-in ("local" means created by current user when not logged in)
	// 2. OR the userId matches the current logged-in user
	const isOwnCheckIn =
		checkInUserId === "local" ||
		(checkInUserId !== "" &&
			currentUserId !== "" &&
			checkInUserId === currentUserId);

	// Check if MenuView is available (not in Expo Go)
	// Use the module-level check to avoid re-checking on every render
	const isMenuViewAvailable = isMenuViewActuallyAvailable;

	// Debug: Log check-in ownership
	React.useEffect(() => {
		console.log("[CheckInFeedItem] Check-in ownership:", {
			checkInUserId,
			currentUserId,
			isOwnCheckIn,
			checkInUserName: checkIn.userName,
		});
	}, [checkInUserId, currentUserId, isOwnCheckIn, checkIn.userName]);

	const getTimeAgo = (timestamp: Date): string => {
		const now = new Date();
		const diffInSeconds = Math.floor(
			(now.getTime() - timestamp.getTime()) / 1000
		);

		if (diffInSeconds < 60) return "Just now";
		const diffInMinutes = Math.floor(diffInSeconds / 60);
		if (diffInMinutes < 60) return `${diffInMinutes}m`;
		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `${diffInHours}h`;
		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays === 1) return "Yesterday";
		if (diffInDays < 7) return `${diffInDays}d`;
		return timestamp.toLocaleDateString([], { month: "short", day: "numeric" });
	};

	const timeAgo = getTimeAgo(checkIn.timestamp);
	const hasPhoto = !!checkIn.photo;
	const hasNote = !!checkIn.note;
	const avatarColor = getAvatarColor(checkIn.userName);
	const initials = checkIn.userName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const handlePressIn = () => {
		scale.value = withTiming(0.97, { duration: 100 });
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 15 });
	};

	const handlePress = () => {
		// Only open story modal if there's a photo
		if (hasPhoto) {
			scale.value = withSequence(
				withTiming(0.98, { duration: 100 }),
				withSpring(1, { damping: 15 })
			);
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			onPress?.();
		}
	};

	const handleLike = (e: any) => {
		e.stopPropagation(); // Prevent triggering card press
		heartScale.value = withSequence(
			withSpring(1.3, { damping: 8, stiffness: 400 }),
			withSpring(1, { damping: 10 })
		);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setLiked(!liked);
	};

	const handleToggleExpand = (e: any) => {
		e.stopPropagation(); // Prevent triggering card press
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setExpanded(!expanded);
	};

	const handleMenuAction = ({
		nativeEvent,
	}: {
		nativeEvent: { event: string };
	}) => {
		const actionId = nativeEvent.event;

		if (actionId === "edit") {
			// TODO: Open edit modal/screen
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		} else if (actionId === "delete") {
			handleDelete();
		}
	};

	const handleLongPress = () => {
		console.log("[CheckInFeedItem] Long press detected!", {
			isOwnCheckIn,
			isMenuViewAvailable,
			checkInUserId,
			currentUserId,
		});
		if (!isOwnCheckIn) {
			console.log("[CheckInFeedItem] Not own check-in, ignoring");
			return;
		}
		scale.value = withSequence(
			withTiming(0.95, { duration: 100 }),
			withSpring(1, { damping: 15 })
		);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		setShowActions(true);
		console.log("[CheckInFeedItem] Setting showActions to true");
	};

	// Test handler to see if Pressable is receiving any touch events
	const handlePressTest = () => {
		console.log("[CheckInFeedItem] Regular press detected");
		handlePress();
	};

	const handleDelete = () => {
		if (!isOwnCheckIn) return;

		Alert.alert(
			"Delete Check-in",
			"Are you sure you want to delete this check-in? This will undo your streak for this day.",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

							// Handle local check-ins vs server check-ins
							if (checkInUserId === "local") {
								// Delete local check-in
								await deleteLocalCheckIn(checkIn.id);
							} else {
								// Archive server check-in
								await archiveCheckIn({
									checkInId: checkIn.id as Id<"checkIns">,
								});
							}

							onDeleted?.();
						} catch (error) {
							Alert.alert(
								"Error",
								"Failed to delete check-in. Please try again."
							);
						}
					},
				},
			]
		);
	};

	// Define menu actions only for own check-ins
	const menuActions = isOwnCheckIn
		? [
				{
					id: "edit",
					title: "Edit",
					image: Platform.select({
						ios: "pencil",
						android: "ic_menu_edit",
					}),
				},
				{
					id: "delete",
					title: "Delete",
					attributes: {
						destructive: true,
					},
					image: Platform.select({
						ios: "trash",
						android: "ic_menu_delete",
					}),
				},
			]
		: [];

	const cardAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const heartAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: heartScale.value }],
	}));

	// Render card content wrapper
	const renderCardWrapper = (content: React.ReactNode) => {
		// Only show menu for own check-ins
		if (!isOwnCheckIn) {
			return content;
		}

		// Always render bottom sheet (for fallback when MenuView doesn't work)
		const bottomSheet = (
			<CheckInActionsBottomSheet
				visible={showActions}
				onClose={() => setShowActions(false)}
				checkIn={checkIn}
				onDeleted={onDeleted}
				onEdited={() => {
					// Trigger refresh - prefer onEdited if provided, otherwise fallback to onDeleted
					onEdited?.() || onDeleted?.();
				}}
			/>
		);

		// Temporarily disable MenuView to test bottom sheet
		// TODO: Re-enable MenuView once we confirm bottom sheet works
		if (false && isMenuViewAvailable) {
			// Try MenuView first, but keep bottom sheet as fallback
			return (
				<>
					<MenuView
						title="Check-in Options"
						actions={menuActions}
						shouldOpenOnLongPress={true}
						onPressAction={handleMenuAction}
						onOpenMenu={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
						}}
						themeVariant={isDark ? "dark" : "light"}
					>
						{content}
					</MenuView>
					{bottomSheet}
				</>
			);
		}

		// Fallback to bottom sheet for Expo Go
		return (
			<>
				{content}
				{bottomSheet}
			</>
		);
	};

	// Photo card variant
	if (hasPhoto) {
		const cardContent = (
			<Pressable
				onPress={handlePressTest}
				onPressIn={() => {
					console.log("[CheckInFeedItem] Press in detected");
					handlePressIn();
				}}
				onPressOut={handlePressOut}
				onLongPress={
					isOwnCheckIn
						? handleLongPress
						: () => {
								console.log(
									"[CheckInFeedItem] Long press detected but not own check-in"
								);
							}
				}
				delayLongPress={400}
			>
				<Animated.View style={cardAnimatedStyle}>
					<SquircleView
						style={[styles.container, { borderRadius: 24 }]}
						cornerSmoothing={1.0}
					>
						<View style={styles.photoContainer}>
							{/* Main Photo */}
							<Image
								source={{ uri: checkIn.photo }}
								style={styles.mainPhoto}
								contentFit="cover"
								transition={300}
							/>

							{/* Overlay gradient */}
							<LinearGradient
								colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.6)"]}
								style={styles.photoOverlay}
							/>
						</View>

						{/* Content section with gradient background */}
						<LinearGradient
							colors={
								isDark
									? ["rgba(139, 92, 246, 0.12)", "rgba(139, 92, 246, 0.04)"]
									: ["rgba(139, 92, 246, 0.08)", "rgba(139, 92, 246, 0.02)"]
							}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={styles.contentGradient}
						>
							<View style={styles.content}>
							{/* Header */}
							<View style={styles.header}>
								<View style={styles.avatarContainer}>
									<LinearGradient
										colors={[avatarColor, `${avatarColor}CC`]}
										style={styles.avatarGradient}
									>
										{checkIn.userAvatar ? (
											<Image
												source={{ uri: checkIn.userAvatar }}
												style={styles.avatarImage}
											/>
										) : (
											<Text style={styles.avatarInitials}>{initials}</Text>
										)}
									</LinearGradient>
									<View
										style={[
											styles.activeIndicator,
											{ borderColor: isDark ? "#1E293B" : "#FFFFFF" },
										]}
									/>
								</View>

								<View style={styles.headerInfo}>
									<Text style={[styles.userName, { color: colors.text }]}>
										{checkIn.userName}
									</Text>
									<Text
										style={[styles.timeAgo, { color: colors.textTertiary }]}
									>
										{timeAgo}
									</Text>
								</View>

								<Pressable
									onPress={handleLike}
									hitSlop={12}
									style={styles.heartButtonRight}
								>
									<Animated.View style={heartAnimatedStyle}>
										<Text style={styles.heartEmoji}>
											{liked ? "❤️" : "🤍"}
										</Text>
									</Animated.View>
								</Pressable>
							</View>

							{/* Note */}
							{hasNote && (
								<View style={styles.noteRow}>
									<Pressable
										onPress={handleToggleExpand}
										style={styles.noteContainer}
									>
										<Text
											style={[styles.noteText, { color: colors.text }]}
											numberOfLines={expanded ? undefined : 3}
										>
											"{checkIn.note}"
										</Text>
									</Pressable>
								</View>
							)}
							</View>
						</LinearGradient>
					</SquircleView>
				</Animated.View>
			</Pressable>
		);

		return renderCardWrapper(cardContent);
	}

	// Text-only card variant
	const textCardContent = (
		<Pressable
			onPress={handlePressTest}
			onPressIn={() => {
				console.log("[CheckInFeedItem] Press in detected");
				handlePressIn();
			}}
			onPressOut={handlePressOut}
			onLongPress={
				isOwnCheckIn
					? handleLongPress
					: () => {
							console.log(
								"[CheckInFeedItem] Long press detected but not own check-in"
							);
						}
			}
			delayLongPress={400}
		>
			<Animated.View style={cardAnimatedStyle}>
				<SquircleView
					style={[styles.container, { borderRadius: 24 }]}
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
						style={styles.gradient}
					>
						<View style={styles.content}>
							{/* Header */}
							<View style={styles.header}>
								<View style={styles.avatarContainer}>
									<LinearGradient
										colors={[avatarColor, `${avatarColor}CC`]}
										style={styles.avatarGradient}
									>
										{checkIn.userAvatar ? (
											<Image
												source={{ uri: checkIn.userAvatar }}
												style={styles.avatarImage}
											/>
										) : (
											<Text style={styles.avatarInitials}>{initials}</Text>
										)}
									</LinearGradient>
									<View
										style={[
											styles.activeIndicator,
											{ borderColor: isDark ? "#1E293B" : "#FFFFFF" },
										]}
									/>
								</View>

								<View style={styles.headerInfo}>
									<Text style={[styles.userName, { color: colors.text }]}>
										{checkIn.userName}
									</Text>
									<Text
										style={[styles.timeAgo, { color: colors.textTertiary }]}
									>
										{timeAgo}
									</Text>
								</View>

								<Pressable
									onPress={handleLike}
									hitSlop={12}
									style={styles.heartButtonRight}
								>
									<Animated.View style={heartAnimatedStyle}>
										<Text style={styles.heartEmoji}>
											{liked ? "❤️" : "🤍"}
										</Text>
									</Animated.View>
								</Pressable>
							</View>

							{/* Note content */}
							{hasNote ? (
								<View style={styles.noteRow}>
									<Pressable
										onPress={handleToggleExpand}
										style={styles.noteContainer}
									>
										<Text
											style={[styles.noteText, { color: colors.text }]}
											numberOfLines={expanded ? undefined : 3}
										>
											{checkIn.note}
										</Text>
									</Pressable>
								</View>
							) : (
								<View style={styles.minimalNoteRow}>
									<View style={styles.minimalNote}>
										<Text
											style={[
												styles.minimalText,
												{ color: colors.textSecondary },
											]}
										>
											Checking in! 💪
										</Text>
									</View>
								</View>
							)}
						</View>
					</LinearGradient>
				</SquircleView>
			</Animated.View>
		</Pressable>
	);

	return renderCardWrapper(textCardContent);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: Theme.spacing.md,
		overflow: "hidden",
	},
	gradient: {
		padding: Theme.spacing.md,
		position: "relative",
		overflow: "hidden",
	},
	contentGradient: {
		padding: Theme.spacing.md,
		position: "relative",
		overflow: "hidden",
	},
	content: {
		position: "relative",
		zIndex: 1,
	},
	// Photo card specific
	photoContainer: {
		width: "100%",
		height: 200,
		position: "relative",
		overflow: "hidden",
	},
	mainPhoto: {
		width: "100%",
		height: "100%",
		backgroundColor: "#1E293B",
	},
	photoOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	// Header
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: Theme.spacing.sm,
	},
	avatarContainer: {
		position: "relative",
		marginRight: Theme.spacing.sm,
	},
	avatarGradient: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: "rgba(255,255,255,0.2)",
	},
	avatarImage: {
		width: 36,
		height: 36,
		borderRadius: 18,
	},
	avatarInitials: {
		fontSize: 16,
		fontWeight: "700",
		color: "#FFFFFF",
	},
	activeIndicator: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: "#22C55E",
		borderWidth: 2,
	},
	headerInfo: {
		flex: 1,
	},
	userName: {
		fontSize: Theme.typography.fontSize.base,
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: 2,
		letterSpacing: -0.2,
	},
	timeAgo: {
		fontSize: Theme.typography.fontSize.xs,
		fontWeight: Theme.typography.fontWeight.medium,
	},
	// Note
	noteRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Theme.spacing.sm,
	},
	noteContainer: {
		flex: 1,
	},
	noteText: {
		fontSize: Theme.typography.fontSize.sm,
		lineHeight: 20,
		fontWeight: Theme.typography.fontWeight.normal,
		fontStyle: "italic",
	},
	minimalNoteRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Theme.spacing.sm,
	},
	minimalNote: {
		flex: 1,
	},
	minimalText: {
		fontSize: Theme.typography.fontSize.sm,
		fontWeight: Theme.typography.fontWeight.medium,
		fontStyle: "italic",
	},
	// Heart button
	heartButton: {
		position: "absolute",
		bottom: Theme.spacing.sm,
		right: Theme.spacing.sm,
		zIndex: 10,
	},
	heartButtonRight: {
		justifyContent: "center",
		alignItems: "center",
		paddingLeft: Theme.spacing.xs,
	},
	heartEmoji: {
		fontSize: 24,
	},
});
