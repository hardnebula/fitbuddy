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
	StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Card } from "../../components/Card";
import { Logo } from "../../components/Logo";
import { useScrollIndicator } from "../../components/ScrollIndicator";
import { Theme } from "../../constants/Theme";
import { useTheme } from "../../contexts/ThemeContext";

export default function JoinGroupScreen() {
	const router = useRouter();
	const { colors, isDark } = useTheme();
	const [inviteCode, setInviteCode] = useState("");
	const {
		contentHeight,
		viewHeight,
		handleScroll,
		handleContentSizeChange,
		handleLayout,
	} = useScrollIndicator();

	const handleJoinGroup = () => {
		if (!inviteCode.trim()) {
			Alert.alert("Error", "Please enter an invite code");
			return;
		}
		// In a real app, validate the code with backend
		// For now, navigate to main app
		router.replace("/(tabs)/home");
	};

	// Mock group preview data
	const groupPreview = {
		name: "Morning Runners",
		members: 3,
		streak: 8,
	};

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
									<Logo size={80} style={styles.logo} />
									<Text style={[styles.title, { color: colors.text }]}>
										Join Group
									</Text>
									<Text
										style={[styles.subtitle, { color: colors.textSecondary }]}
									>
										Enter your invite code to join a group
									</Text>
								</View>

								{/* Invite Code Section */}
								<View style={styles.section}>
									<Input
										label="Invite Code"
										placeholder="FITBUDDY-XXXXXX"
										value={inviteCode}
										onChangeText={(text) => {
											// Format invite code: uppercase and add dash if needed
											const formatted = text
												.toUpperCase()
												.replace(/[^A-Z0-9-]/g, "");
											setInviteCode(formatted);
										}}
										autoCapitalize="characters"
										containerStyle={styles.inputContainer}
										style={{
											fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
											letterSpacing: 1,
											fontSize: Theme.typography.fontSize.lg,
											fontWeight: Theme.typography.fontWeight.semibold,
										}}
									/>
								</View>

								{/* Group Preview */}
								{inviteCode.length > 0 && (
									<View style={styles.section}>
										<Card
											style={StyleSheet.flatten([
												styles.previewCard,
												{ backgroundColor: colors.card },
											])}
											glow
										>
											<Text
												style={[
													styles.previewTitle,
													{ color: colors.text },
												]}
											>
												Group Preview
											</Text>
											<View style={styles.previewContent}>
												<Text
													style={[
														styles.groupName,
														{ color: colors.text },
													]}
												>
													{groupPreview.name}
												</Text>
												<View style={styles.previewRow}>
													<Text
														style={[
															styles.previewLabel,
															{ color: colors.textSecondary },
														]}
													>
														Members:
													</Text>
													<Text
														style={[
															styles.previewValue,
															{ color: colors.text },
														]}
													>
														{groupPreview.members}
													</Text>
												</View>
												<View style={styles.previewRow}>
													<Text
														style={[
															styles.previewLabel,
															{ color: colors.textSecondary },
														]}
													>
														Group Streak:
													</Text>
													<Text
														style={[
															styles.previewValue,
															styles.streak,
															{ color: colors.primary },
														]}
													>
														{groupPreview.streak} days 🔥
													</Text>
												</View>
											</View>
										</Card>
									</View>
								)}

								{/* Join Button */}
								<View style={styles.joinButtonContainer}>
									<Button
										title="Join Group"
										onPress={handleJoinGroup}
										fullWidth
										size="large"
										disabled={!inviteCode.trim()}
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
	inputContainer: {
		marginBottom: 0,
	},
	previewCard: {
		marginTop: Theme.spacing.sm,
	},
	previewTitle: {
		fontSize: Theme.typography.fontSize.md,
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: Theme.spacing.md,
	},
	previewContent: {
		gap: Theme.spacing.sm,
	},
	groupName: {
		fontSize: Theme.typography.fontSize.lg,
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: Theme.spacing.sm,
	},
	previewRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	previewLabel: {
		fontSize: Theme.typography.fontSize.base,
	},
	previewValue: {
		fontSize: Theme.typography.fontSize.base,
		fontWeight: Theme.typography.fontWeight.semibold,
	},
	streak: {
		fontWeight: Theme.typography.fontWeight.bold,
	},
	joinButtonContainer: {
		marginTop: Theme.spacing.sm,
		marginBottom: Theme.spacing.md,
	},
});
