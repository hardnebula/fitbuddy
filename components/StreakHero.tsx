import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSpring,
	withTiming,
	interpolate,
	Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import SquircleView from "@/components/SquircleView";
import { Theme } from "@/constants/Theme";
import { useTheme } from "@/contexts/ThemeContext";

interface StreakHeroProps {
	streak: number;
	bestStreak?: number;
}

export function StreakHero({ streak, bestStreak }: StreakHeroProps) {
	const { colors, isDark } = useTheme();
	const fireScale = useSharedValue(1);
	const fireRotation = useSharedValue(0);
	const glowOpacity = useSharedValue(0.2);
	const glowScale = useSharedValue(0.95);
	const glowIntensity = useSharedValue(0.3);
	const shadowRadius = useSharedValue(12);

	// Spring configuration for fire icon animations
	const fireSpringConfig = {
		damping: 20,
		stiffness: 120,
		mass: 0.8,
	};

	// Spring configuration for glow animations - slower and smoother, independent
	const glowSpringConfig = {
		damping: 12,
		stiffness: 80,
		mass: 1.2,
	};

	useEffect(() => {
		// Smooth pulsing scale animation for fire icon
		fireScale.value = withRepeat(withSpring(1.08, fireSpringConfig), -1, true);

		// Smooth rotation animation for fire icon
		fireRotation.value = withRepeat(withSpring(-4, fireSpringConfig), -1, true);

		// Pulsing glow opacity - more pronounced, independent animation
		glowOpacity.value = withRepeat(withSpring(0.8, glowSpringConfig), -1, true);

		// Glow scale animation - more pronounced breathing effect
		glowScale.value = withRepeat(withSpring(1.25, glowSpringConfig), -1, true);

		// Glow intensity variation - more pronounced
		glowIntensity.value = withRepeat(
			withSpring(0.9, glowSpringConfig),
			-1,
			true
		);

		// Shadow radius pulsing - more pronounced blur effect
		shadowRadius.value = withRepeat(withSpring(35, glowSpringConfig), -1, true);
	}, []);

	const fireAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ scale: fireScale.value },
				{ rotate: `${fireRotation.value}deg` },
			],
			shadowColor: colors.primary,
			shadowOffset: { width: 0, height: 0 },
			shadowOpacity: interpolate(glowIntensity.value, [0.3, 0.9], [0.4, 0.7]),
			shadowRadius: shadowRadius.value,
			elevation: interpolate(glowIntensity.value, [0.3, 0.9], [10, 18]),
		};
	}, [colors.primary]);

	const glowAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: glowOpacity.value,
			transform: [{ scale: glowScale.value }],
		};
	});

	const innerGlowStyle = useAnimatedStyle(() => {
		return {
			opacity: interpolate(glowIntensity.value, [0.3, 0.9], [0.2, 0.5]),
			transform: [
				{ scale: interpolate(glowScale.value, [0.95, 1.25], [0.65, 0.9]) },
			],
		};
	});

	// Animated styles for diffused outer layers - updated ranges
	const outerGlowLayer1Style = useAnimatedStyle(() => {
		const baseOpacity = interpolate(glowOpacity.value, [0.2, 0.8], [0.15, 0.3]);
		return {
			opacity: baseOpacity,
			transform: [
				{ scale: interpolate(glowScale.value, [0.95, 1.25], [1.1, 1.4]) },
			],
		};
	});

	const outerGlowLayer2Style = useAnimatedStyle(() => {
		const baseOpacity = interpolate(
			glowOpacity.value,
			[0.2, 0.8],
			[0.08, 0.18]
		);
		return {
			opacity: baseOpacity,
			transform: [
				{ scale: interpolate(glowScale.value, [0.95, 1.25], [1.2, 1.5]) },
			],
		};
	});

	const innerGlowLayer1Style = useAnimatedStyle(() => {
		const baseOpacity = interpolate(
			glowIntensity.value,
			[0.3, 0.9],
			[0.15, 0.4]
		);
		return {
			opacity: baseOpacity,
			transform: [
				{ scale: interpolate(glowScale.value, [0.95, 1.25], [0.7, 0.95]) },
			],
		};
	});

	const FireIcon = () => (
		<Animated.View style={[fireAnimatedStyle, styles.fireIconContainer]}>
			<Text style={styles.fireEmoji}>🔥</Text>
		</Animated.View>
	);

	return (
		<SquircleView
			style={[
				styles.container,
				{
					borderRadius: 24,
					borderColor: colors.primary,
					borderWidth: 1.5,
				},
			]}
			cornerSmoothing={1.0}
		>
			<LinearGradient
				colors={
					isDark
						? ["rgba(139, 92, 246, 0.25)", "rgba(139, 92, 246, 0.1)"]
						: ["rgba(139, 92, 246, 0.2)", "rgba(139, 92, 246, 0.05)"]
				}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.gradient}
			>
				<View style={styles.content}>
					<View style={styles.fireContainer}>
						{/* Outer glow layers - diffused edges */}
						{/* Layer 3 - outermost, most diffused */}
						<Animated.View
							style={[
								styles.glow,
								styles.glowOuterLayer3,
								outerGlowLayer2Style,
							]}
						>
							<View
								style={[
									styles.glowCircle,
									styles.glowCircleOuter3,
									{ backgroundColor: colors.primary },
								]}
							/>
						</Animated.View>
						{/* Layer 2 - middle outer */}
						<Animated.View
							style={[
								styles.glow,
								styles.glowOuterLayer2,
								outerGlowLayer1Style,
							]}
						>
							<View
								style={[
									styles.glowCircle,
									styles.glowCircleOuter2,
									{ backgroundColor: colors.primary },
								]}
							/>
						</Animated.View>
						{/* Layer 1 - main outer glow */}
						<Animated.View
							style={[styles.glow, styles.glowOuter, glowAnimatedStyle]}
						>
							<View
								style={[
									styles.glowCircle,
									styles.glowCircleOuter1,
									{ backgroundColor: colors.primary },
								]}
							/>
						</Animated.View>
						{/* Inner glow layers - diffused edges */}
						{/* Inner layer 2 */}
						<Animated.View
							style={[
								styles.glow,
								styles.glowInnerLayer2,
								innerGlowLayer1Style,
							]}
						>
							<View
								style={[
									styles.glowCircle,
									styles.glowCircleInner2,
									{ backgroundColor: colors.primary },
								]}
							/>
						</Animated.View>
						{/* Inner layer 1 - main inner glow */}
						<Animated.View
							style={[styles.glow, styles.glowInner, innerGlowStyle]}
						>
							<View
								style={[
									styles.glowCircle,
									styles.glowCircleInner,
									{ backgroundColor: colors.primary },
								]}
							/>
						</Animated.View>
						{/* Fire icon with shadow/blur */}
						<FireIcon />
					</View>

					<View style={styles.streakInfo}>
						<Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
							Current Streak
						</Text>
						<Text
							style={[
								styles.streakNumber,
								{
									color: colors.primary,
									textShadowColor: colors.primary,
									textShadowRadius: 15,
								},
							]}
						>
							{streak}
						</Text>
						<Text style={[styles.streakDays, { color: colors.textTertiary }]}>
							{streak === 1 ? "day" : "days"} 🔥
						</Text>
					</View>
				</View>
			</LinearGradient>
		</SquircleView>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: Theme.spacing.xl,
		overflow: "hidden",
		shadowColor: "#8B5CF6",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 15,
		elevation: 8,
	},
	gradient: {
		padding: Theme.spacing.xl,
		position: "relative",
		overflow: "hidden",
	},
	glow: {
		position: "absolute",
		top: "50%",
		left: "50%",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 0,
	},
	glowOuter: {
		width: 240,
		height: 240,
		marginTop: -120,
		marginLeft: -120,
	},
	glowOuterLayer2: {
		width: 280,
		height: 280,
		marginTop: -140,
		marginLeft: -140,
	},
	glowOuterLayer3: {
		width: 320,
		height: 320,
		marginTop: -160,
		marginLeft: -160,
	},
	glowInner: {
		width: 160,
		height: 160,
		marginTop: -80,
		marginLeft: -80,
	},
	glowInnerLayer2: {
		width: 180,
		height: 180,
		marginTop: -90,
		marginLeft: -90,
	},
	glowCircle: {
		borderRadius: 1000,
	},
	glowCircleOuter1: {
		width: 240,
		height: 240,
		borderRadius: 120,
		opacity: 0.3,
		shadowColor: "#8B5CF6",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.4,
		shadowRadius: 25,
		elevation: 10,
	},
	glowCircleOuter2: {
		width: 280,
		height: 280,
		borderRadius: 140,
		opacity: 0.15,
		shadowColor: "#8B5CF6",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 30,
		elevation: 8,
	},
	glowCircleOuter3: {
		width: 320,
		height: 320,
		borderRadius: 160,
		opacity: 0.08,
		shadowColor: "#8B5CF6",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.2,
		shadowRadius: 35,
		elevation: 6,
	},
	glowCircleInner: {
		width: 160,
		height: 160,
		borderRadius: 80,
		opacity: 0.25,
		shadowColor: "#8B5CF6",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 8,
	},
	glowCircleInner2: {
		width: 180,
		height: 180,
		borderRadius: 90,
		opacity: 0.15,
		shadowColor: "#8B5CF6",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.25,
		shadowRadius: 22,
		elevation: 6,
	},
	content: {
		alignItems: "center",
		zIndex: 1,
		position: "relative",
	},
	fireContainer: {
		marginBottom: Theme.spacing.md,
		position: "relative",
		zIndex: 1,
		width: 400,
		height: 100,
		justifyContent: "center",
		alignItems: "center",
		overflow: "visible",
	},
	fireIconContainer: {
		justifyContent: "center",
		alignItems: "center",
		minHeight: 80,
		minWidth: 80,
	},
	fireEmoji: {
		fontSize: 64,
		lineHeight: 80,
		textAlign: "center",
		includeFontPadding: false,
		textAlignVertical: "center",
	},
	streakInfo: {
		alignItems: "center",
	},
	streakLabel: {
		fontSize: Theme.typography.fontSize.sm,
		fontWeight: Theme.typography.fontWeight.medium,
		marginBottom: Theme.spacing.xs,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	streakNumber: {
		fontSize: 56,
		fontWeight: Theme.typography.fontWeight.bold,
		lineHeight: 64,
		marginBottom: Theme.spacing.xs,
	},
	streakDays: {
		fontSize: Theme.typography.fontSize.base,
		fontWeight: Theme.typography.fontWeight.semibold,
	},
	bestStreakContainer: {
		marginTop: Theme.spacing.md,
		paddingTop: Theme.spacing.md,
		borderTopWidth: 1,
		borderTopColor: "rgba(139, 92, 246, 0.2)",
		width: "100%",
		alignItems: "center",
	},
	bestStreakLabel: {
		fontSize: Theme.typography.fontSize.sm,
		fontWeight: Theme.typography.fontWeight.medium,
	},
});
