import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { HighFiveCheckInButton } from "@/components/HighFiveCheckInButton";
import { Theme } from "@/constants/Theme";
import { useTheme } from "@/contexts/ThemeContext";

interface HeroCardProps {
	hasCheckedInToday: boolean;
	lastCheckIn?: string;
	onCheckInPress: () => void;
}

export function HeroCard({
	hasCheckedInToday,
	lastCheckIn,
	onCheckInPress,
}: HeroCardProps) {
	const { colors } = useTheme();

	return (
		<View style={styles.container}>
			<HighFiveCheckInButton
				onPress={onCheckInPress}
				disabled={hasCheckedInToday}
				hasCheckedIn={hasCheckedInToday}
			/>

			{lastCheckIn && !hasCheckedInToday && (
				<Text style={[styles.lastCheckIn, { color: colors.textTertiary }]}>
					Last check-in: {lastCheckIn}
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: Theme.spacing.xl,
		alignItems: "center",
	},
	lastCheckIn: {
		fontSize: Theme.typography.fontSize.sm,
		marginTop: Theme.spacing.sm,
	},
});
