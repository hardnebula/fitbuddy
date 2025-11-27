import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";

export default function OnboardingLayout() {
	const { colors } = useTheme();

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "slide_from_right",
				animationDuration: 300,
				contentStyle: {
					backgroundColor: colors.background,
				},
				presentation: "card",
			}}
		>
			<Stack.Screen name="goal" />
			<Stack.Screen name="activity-style" />
			<Stack.Screen name="accountability" />
			<Stack.Screen name="personality" />
			<Stack.Screen name="training-time" />
			<Stack.Screen name="profile-setup" />
			<Stack.Screen name="final" />
		</Stack>
	);
}
