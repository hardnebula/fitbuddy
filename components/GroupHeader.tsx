import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Theme } from "@/constants/Theme";
import { useTheme } from "@/contexts/ThemeContext";
import { Id } from "@/convex/_generated/dataModel";

interface GroupHeaderProps {
	group: {
		_id: Id<"groups">;
		name: string;
		groupStreak: number;
	} | null;
	memberCount?: number;
	groupImage?: string | null;
	onMenuPress?: () => void;
}

export function GroupHeader({
	group,
	memberCount,
	groupImage,
	onMenuPress,
}: GroupHeaderProps) {
	const { colors } = useTheme();

	return (
		<View style={styles.header}>
			<View
				style={[
					styles.groupImageContainer,
					{
						backgroundColor: colors.cardSecondary,
						borderColor: colors.border,
					},
				]}
			>
				{group ? (
					groupImage ? (
						<Image source={{ uri: groupImage }} style={styles.groupImage} />
					) : (
						<View style={styles.groupImagePlaceholder}>
							<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
								<Path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									stroke={colors.primary}
									d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
								/>
							</Svg>
						</View>
					)
				) : (
					<View style={styles.groupImagePlaceholder}>
						<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
							<Path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								stroke={colors.primary}
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</Svg>
					</View>
				)}
			</View>

			<TouchableOpacity
				onPress={onMenuPress}
				activeOpacity={0.7}
				style={styles.groupInfo}
			>
				<View style={styles.groupNameRow}>
					<Text
						style={[styles.groupName, { color: colors.text }]}
						numberOfLines={1}
					>
						{group ? group.name : "Personal"}
					</Text>
					<View
						style={[
							styles.chevronButton,
							{ backgroundColor: colors.cardSecondary },
						]}
					>
						<Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
							<Path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2.5}
								stroke={colors.textSecondary}
								d="M6 9l6 6 6-6"
							/>
						</Svg>
					</View>
				</View>
				{group && memberCount !== undefined && (
					<Text style={[styles.groupSubtext, { color: colors.textTertiary }]}>
						{memberCount} {memberCount === 1 ? "member" : "members"}
					</Text>
				)}
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Theme.spacing.md,
		gap: Theme.spacing.sm,
		paddingVertical: Theme.spacing.xs,
	},
	groupImageContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		overflow: "hidden",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		flexShrink: 0,
	},
	groupImage: {
		width: "100%",
		height: "100%",
	},
	groupImagePlaceholder: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	groupInfo: {
		flex: 1,
		justifyContent: "center",
		minWidth: 0,
	},
	groupNameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Theme.spacing.xs,
	},
	groupName: {
		fontSize: Theme.typography.fontSize.lg,
		fontWeight: Theme.typography.fontWeight.bold,
		flexShrink: 1,
	},
	chevronButton: {
		width: 24,
		height: 24,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		flexShrink: 0,
	},
	groupSubtext: {
		fontSize: Theme.typography.fontSize.xs,
		marginTop: 1,
	},
});
