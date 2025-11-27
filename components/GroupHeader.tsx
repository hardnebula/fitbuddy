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
	onImagePress?: () => void;
	onMenuPress?: () => void;
}

export function GroupHeader({
	group,
	memberCount,
	groupImage,
	onImagePress,
	onMenuPress,
}: GroupHeaderProps) {
	const { colors } = useTheme();

	if (!group) {
		return null;
	}

	return (
		<View style={styles.header}>
			<View style={styles.headerLeft}>
				<TouchableOpacity
					onPress={onImagePress}
					activeOpacity={0.7}
					style={[
						styles.groupImageContainer,
						{
							backgroundColor: colors.cardSecondary,
							borderColor: colors.border,
						},
					]}
				>
					{groupImage ? (
						<>
							<Image source={{ uri: groupImage }} style={styles.groupImage} />
							<View
								style={[
									styles.cameraIconOverlay,
									{ backgroundColor: colors.overlay },
								]}
							>
								<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
									<Path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										stroke={colors.text}
										d="M6.827 6.175h2.304a2 2 0 0 1 1.682.94l.836 1.261c.498.85.608 1.968.272 2.914-.214.557-.124 1.191.235 1.648a2.5 2.5 0 0 0 3.414.58l1.304-.997a2 2 0 0 1 1.682-.94h2.304M15.714 12.175a3 3 0 1 1-5.196-3 3 3 0 0 1 5.196 3Z"
									/>
									<Path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										stroke={colors.text}
										d="M19.5 19.5h-15A2.5 2.5 0 0 1 2 17V7.5a2.5 2.5 0 0 1 2.5-2.5h15A2.5 2.5 0 0 1 22 7.5V17a2.5 2.5 0 0 1-2.5 2.5Z"
									/>
								</Svg>
							</View>
						</>
					) : (
						<View style={styles.groupImagePlaceholder}>
							<Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
								<Path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									stroke={colors.textSecondary}
									d="M6.827 6.175h2.304a2 2 0 0 1 1.682.94l.836 1.261c.498.85.608 1.968.272 2.914-.214.557-.124 1.191.235 1.648a2.5 2.5 0 0 0 3.414.58l1.304-.997a2 2 0 0 1 1.682-.94h2.304M15.714 12.175a3 3 0 1 1-5.196-3 3 3 0 0 1 5.196 3Z"
								/>
								<Path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									stroke={colors.textSecondary}
									d="M19.5 19.5h-15A2.5 2.5 0 0 1 2 17V7.5a2.5 2.5 0 0 1 2.5-2.5h15A2.5 2.5 0 0 1 22 7.5V17a2.5 2.5 0 0 1-2.5 2.5Z"
								/>
							</Svg>
						</View>
					)}
				</TouchableOpacity>
				<View style={styles.groupInfo}>
					<View style={styles.groupNameRow}>
						<Text style={[styles.groupName, { color: colors.text }]}>
							{group.name}
						</Text>
						<TouchableOpacity
							onPress={onMenuPress}
							activeOpacity={0.6}
							style={styles.chevronButton}
						>
							<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
								<Path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									stroke={colors.textSecondary}
									d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
								/>
							</Svg>
						</TouchableOpacity>
					</View>
					{memberCount !== undefined && (
						<Text style={[styles.groupSubtext, { color: colors.textTertiary }]}>
							{memberCount} {memberCount === 1 ? "member" : "members"}
						</Text>
					)}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: Theme.spacing.xl,
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: Theme.spacing.md,
		flex: 1,
	},
	groupImageContainer: {
		width: 64,
		height: 64,
		borderRadius: 32,
		overflow: "hidden",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		position: "relative",
	},
	groupImage: {
		width: 64,
		height: 64,
	},
	cameraIconOverlay: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: 24,
		height: 24,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: "transparent",
	},
	groupImagePlaceholder: {
		width: 64,
		height: 64,
		justifyContent: "center",
		alignItems: "center",
	},
	groupInfo: {
		flex: 1,
	},
	groupNameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Theme.spacing.xs,
	},
	groupName: {
		fontSize: 28,
		fontWeight: Theme.typography.fontWeight.bold,
		flex: 1,
	},
	chevronButton: {
		padding: Theme.spacing.xs,
		marginLeft: -Theme.spacing.xs,
	},
	groupSubtext: {
		fontSize: Theme.typography.fontSize.sm,
		marginTop: Theme.spacing.xs,
	},
});
