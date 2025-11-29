import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	StatusBar,
	ScrollView,
	Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelectionChip } from "../../components/SelectionChip";
import { ProgressDots } from "../../components/ProgressDots";
import { OnboardingNavigation } from "../../components/OnboardingNavigation";
import {
	ScrollIndicator,
	useScrollIndicator,
} from "../../components/ScrollIndicator";
import { Theme } from "../../constants/Theme";
import { useTheme } from "../../contexts/ThemeContext";
import { useOnboarding } from "../../contexts/OnboardingContext";

const ACTIVITIES = [
	"🏋️ Gym",
	"🏃 Running",
	"🚶 Walking",
	"⚽ Sports",
	"🧘 Yoga / Mobility",
	"💪 Whatever I can that day",
];

export default function ActivityStyleScreen() {
	const router = useRouter();
	const { colors, isDark } = useTheme();
	const { updateOnboardingData } = useOnboarding();
	const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
	const {
		scrollPosition,
		contentHeight,
		viewHeight,
		handleScroll,
		handleContentSizeChange,
		handleLayout,
	} = useScrollIndicator();

	const handleContinue = async () => {
		if (selectedActivity) {
			await updateOnboardingData({ activityStyle: selectedActivity });
			router.push("/(onboarding)/accountability");
		}
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
					<ProgressDots total={7} current={1} />
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
							<Image
								source={require("../../assets/images/Onboarding/FitTeo.png")}
								style={styles.illustration}
								resizeMode="contain"
							/>
							<Text style={[styles.title, { color: colors.text }]}>
								What do you want to stay accountable for?
							</Text>
							<Text style={[styles.subtitle, { color: colors.textSecondary }]}>
								Just to personalize your experience.
							</Text>

							<View style={styles.chipsContainer}>
								{ACTIVITIES.map((activity) => (
									<View key={activity} style={styles.chipWrapper}>
										<SelectionChip
											label={activity}
											selected={selectedActivity === activity}
											onPress={() => setSelectedActivity(activity)}
										/>
									</View>
								))}
							</View>
						</View>
					</ScrollView>

					<ScrollIndicator
						scrollPosition={scrollPosition}
						contentHeight={contentHeight}
						viewHeight={viewHeight}
					/>
				</View>

				{/* Fixed Navigation Buttons - Always visible at bottom */}
				<View style={styles.navigationContainer}>
					<OnboardingNavigation
						onBack={() => router.back()}
						onNext={handleContinue}
						nextLabel="Next"
						nextDisabled={!selectedActivity}
					/>
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
		paddingTop: Theme.spacing.md,
		paddingBottom: Theme.spacing.md,
	},
	navigationContainer: {
		paddingTop: Theme.spacing.sm,
	},
	illustration: {
		width: 120,
		height: 120,
		alignSelf: "center",
		marginBottom: Theme.spacing.md,
	},
	title: {
		fontSize: 28,
		fontWeight: "700",
		marginBottom: Theme.spacing.sm,
	},
	subtitle: {
		fontSize: 16,
		marginBottom: Theme.spacing.xl,
	},
	chipsContainer: {
		gap: Theme.spacing.md,
	},
	chipWrapper: {
		width: "100%",
	},
});
