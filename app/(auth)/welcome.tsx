import React from "react";
import {
	View,
	Text,
	StyleSheet,
	StatusBar,
	Image,
	TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { Theme } from "../../constants/Theme";
import { useTheme } from "../../contexts/ThemeContext";

export default function WelcomeScreen() {
	const router = useRouter();
	const { colors, isDark } = useTheme();

	const handleGetStarted = () => {
		router.replace("/(onboarding)/goal");
	};

	const handleSignIn = () => {
		router.push("/(auth)/sign-in");
	};

	return (
		<>
			<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.background }]}
				edges={["top", "bottom"]}
			>
				<View style={styles.content}>
					{/* Logo */}
					<View style={styles.logoContainer}>
						<Image
							source={require("../../assets/images/Logo-teo-Photoroom.png")}
							style={styles.logo}
							resizeMode="contain"
						/>
					</View>

					{/* Text Content */}
					<View style={styles.textContainer}>
						<Text style={[styles.title, { color: colors.text }]}>
							Welcome to Teo
						</Text>
						<Text style={[styles.subtitle, { color: colors.textSecondary }]}>
							Stay consistent with the people you trust.
						</Text>
					</View>

					{/* Spacer */}
					<View style={styles.spacer} />

					{/* Buttons */}
					<View style={styles.buttonContainer}>
						<Button
							title="Sign In"
							onPress={handleSignIn}
							fullWidth
							size="large"
							variant="outline"
						/>
						<Button
							title="Get Started →"
							onPress={handleGetStarted}
							fullWidth
							size="large"
						/>
						<Text style={[styles.hintText, { color: colors.textTertiary }]}>
							New users must complete onboarding first
						</Text>
					</View>
				</View>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: Theme.spacing.xl,
	},
	logoContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 60,
	},
	logo: {
		width: 180,
		height: 180,
	},
	textContainer: {
		alignItems: "center",
		paddingHorizontal: Theme.spacing.md,
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
		textAlign: "center",
		marginBottom: Theme.spacing.md,
	},
	subtitle: {
		fontSize: 18,
		textAlign: "center",
		lineHeight: 26,
	},
	spacer: {
		flex: 1,
	},
	buttonContainer: {
		paddingBottom: Theme.spacing.lg,
		gap: Theme.spacing.md,
	},
	hintText: {
		fontSize: 14,
		textAlign: "center",
		marginTop: Theme.spacing.sm,
	},
});
