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

const GOALS = [
	"🎯 Stay consistent",
	"🔄 Get back on track",
	"👥 Train with friends",
	"😊 Feel better",
	"📋 Build a simple routine",
	"⚡ Boost my energy",
];

export default function GoalScreen() {
	const router = useRouter();
	const { colors, isDark } = useTheme();
	const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
	const {
		scrollPosition,
		contentHeight,
		viewHeight,
		handleScroll,
		handleContentSizeChange,
		handleLayout,
	} = useScrollIndicator();

	const handleContinue = () => {
		if (selectedGoal) {
			router.push("/(onboarding)/activity-style");
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
					<ProgressDots total={7} current={0} />
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
								source={
									isDark
										? require("../../assets/images/Onboarding/Patapreguntadarkmode.png")
										: require("../../assets/images/Onboarding/Pata Pregunta.png")
								}
								style={styles.illustration}
								resizeMode="contain"
							/>
							<Text style={[styles.title, { color: colors.text }]}>
								What's your main intention?
							</Text>
							<Text style={[styles.subtitle, { color: colors.textSecondary }]}>
								Choose one. Keep it simple.
							</Text>

							<View style={styles.chipsContainer}>
								{GOALS.map((goal) => (
									<View key={goal} style={styles.chipWrapper}>
										<SelectionChip
											label={goal}
											selected={selectedGoal === goal}
											onPress={() => setSelectedGoal(goal)}
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
						onNext={handleContinue}
						nextLabel="Next"
						nextDisabled={!selectedGoal}
						showBack={false}
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
