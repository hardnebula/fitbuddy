import React, { useEffect } from "react";
import { Text, StyleSheet, ViewStyle, Pressable } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useTheme } from "../contexts/ThemeContext";

interface SelectionChipProps {
	label: string;
	selected: boolean;
	onPress: () => void;
	style?: ViewStyle;
}

export function SelectionChip({
	label,
	selected,
	onPress,
	style,
}: SelectionChipProps) {
	const { colors } = useTheme();
	const scale = useSharedValue(1);
	const checkmarkOpacity = useSharedValue(selected ? 1 : 0);

	useEffect(() => {
		if (selected) {
			// Subtle checkmark animation - just fade in
			checkmarkOpacity.value = withTiming(1, { duration: 200 });
			// Haptic feedback on selection
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		} else {
			checkmarkOpacity.value = withTiming(0, { duration: 150 });
		}
	}, [selected]);

	const handlePressIn = () => {
		scale.value = withTiming(0.97, { duration: 100 });
	};

	const handlePressOut = () => {
		scale.value = withTiming(1, { duration: 150 });
	};

	const handlePress = () => {
		onPress();
	};

	const chipAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: scale.value }],
		};
	});

	const checkmarkAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: checkmarkOpacity.value,
		};
	});

	return (
		<Pressable
			onPress={handlePress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={style}
		>
			<Animated.View
				style={[
					styles.chip,
					chipAnimatedStyle,
					{
						backgroundColor: selected ? colors.primary + "15" : colors.card,
						borderColor: selected ? colors.primary : colors.border,
					},
				]}
			>
				<Animated.View style={styles.touchable}>
					<Text
						style={[
							styles.chipText,
							{ color: selected ? colors.primary : colors.text },
						]}
					>
						{label}
					</Text>
					<Animated.View
						style={[styles.checkIconContainer, checkmarkAnimatedStyle]}
					>
						<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
							<Path
								d="M20 6L9 17l-5-5"
								stroke={colors.primary}
								strokeWidth={2.5}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</Svg>
					</Animated.View>
				</Animated.View>
			</Animated.View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	chip: {
		borderRadius: 16,
		borderWidth: 2,
		minHeight: 56,
		overflow: "hidden",
	},
	touchable: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 16,
		paddingHorizontal: 20,
		width: "100%",
	},
	chipText: {
		fontSize: 16,
		fontWeight: "500",
		flex: 1,
	},
	checkIconContainer: {
		marginLeft: 8,
	},
});
