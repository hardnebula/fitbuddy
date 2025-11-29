import React, { useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	StatusBar,
	ScrollView,
	TouchableOpacity,
	Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { ProgressDots } from "../../components/ProgressDots";
import { useScrollIndicator } from "../../components/ScrollIndicator";
import { Theme } from "../../constants/Theme";
import { useTheme } from "../../contexts/ThemeContext";
import { useOnboarding } from "../../contexts/OnboardingContext";

export default function FinalScreen() {
	const router = useRouter();
	const { colors, isDark } = useTheme();
	const { markOnboardingComplete } = useOnboarding();
	const {
		contentHeight,
		viewHeight,
		handleScroll,
		handleContentSizeChange,
		handleLayout,
	} = useScrollIndicator();

	// Mark onboarding as complete when screen mounts
	useEffect(() => {
		const markComplete = async () => {
			try {
				await markOnboardingComplete();
			} catch (error) {
				console.error("Error marking onboarding complete:", error);
			}
		};
		markComplete();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleCreateGroup = () => {
		router.push("/(auth)/create-group");
	};

	const handleJoinGroup = () => {
		router.push("/(auth)/join-group");
	};

	const handleSkip = () => {
		router.replace("/(tabs)/home");
	};

	return (
		<>
			<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.background }]}
				edges={["top", "bottom"]}
			>
				{/* Fixed Progress Dots - Always visible at top */}
				<View style={styles.progressContainer}>
					<ProgressDots total={7} current={6} />
				</View>

				{/* Scrollable Content Area */}
				<View style={styles.scrollContainer} onLayout={handleLayout}>
					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
						showsVerticalScrollIndicator={false}
						onScroll={handleScroll}
						onContentSizeChange={handleContentSizeChange}
						scrollEventThrottle={16}
						scrollEnabled={contentHeight > viewHeight + 5 && viewHeight > 0}
					>
						<View style={styles.content}>
							<Text style={[styles.title, { color: colors.text }]}>
								You're all set!
							</Text>
							<Text style={[styles.subtitle, { color: colors.textSecondary }]}>
								Create your first group or join one.
							</Text>

							<View style={styles.buttonsContainer}>
								<Button
									title="Create a Group"
									onPress={handleCreateGroup}
									fullWidth
									size="large"
								/>

								<Button
									title="Join a Group"
									onPress={handleJoinGroup}
									variant="outline"
									fullWidth
									size="large"
								/>

								<TouchableOpacity
									onPress={handleSkip}
									style={styles.skipButton}
								>
									<Text
										style={[styles.skipText, { color: colors.textTertiary }]}
									>
										Skip for now
									</Text>
								</TouchableOpacity>
							</View>

							{/* Group Photo Preview */}
							<View
								style={[
									styles.previewSection,
									{ borderTopColor: colors.border },
								]}
							>
								<Text
									style={[styles.previewLabel, { color: colors.textSecondary }]}
								>
									Your journey starts here
								</Text>
								<View style={styles.previewContainer}>
									<Image
										source={require("../../assets/images/Onboarding/Group photo.png")}
										style={styles.groupPhoto}
										resizeMode="contain"
									/>
								</View>
								<Text
									style={[styles.motivationalQuote, { color: colors.text }]}
								>
									"Together we're stronger. Your group is waiting for you!"
								</Text>
								<Text
									style={[
										styles.previewDescription,
										{ color: colors.textTertiary },
									]}
								>
									Join forces with friends and stay accountable 💪
								</Text>
							</View>
						</View>
					</ScrollView>
				</View>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	progressContainer: {
		paddingTop: Theme.spacing.sm,
		paddingBottom: Theme.spacing.xs,
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
	buttonsContainer: {
		gap: Theme.spacing.md,
		marginBottom: Theme.spacing.xl * 2,
	},
	skipButton: {
		paddingVertical: Theme.spacing.md,
		alignItems: "center",
	},
	skipText: {
		fontSize: 16,
		fontWeight: "500",
	},
	previewSection: {
		alignItems: "center",
		paddingTop: Theme.spacing.xl,
		borderTopWidth: 1,
	},
	previewLabel: {
		fontSize: 14,
		marginBottom: Theme.spacing.md,
		fontWeight: "500",
	},
	previewContainer: {
		width: "100%",
		alignItems: "center",
		marginBottom: Theme.spacing.md,
	},
	groupPhoto: {
		width: "100%",
		height: 200,
	},
	motivationalQuote: {
		fontSize: 18,
		fontWeight: "600",
		textAlign: "center",
		marginBottom: Theme.spacing.sm,
		fontStyle: "italic",
		lineHeight: 26,
	},
	previewDescription: {
		fontSize: 14,
		textAlign: "center",
	},
});
