import { Platform, DynamicColorIOS } from "react-native";
import {
	NativeTabs,
	Icon,
	Label,
	VectorIcon,
} from "expo-router/unstable-native-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

export default function TabsLayout() {
	const { colors } = useTheme();

	// Always apply background color as fallback for all platforms
	// backgroundColor ensures consistent appearance across all iOS versions
	const backgroundColor =
		Platform.OS === "ios"
			? DynamicColorIOS({
					dark: colors.surface,
					light: colors.surface,
				})
			: colors.surface;

	return (
		<NativeTabs
			// Selected tab icon color
			tintColor={
				Platform.OS === "ios"
					? DynamicColorIOS({
							dark: colors.primary,
							light: colors.primary,
						})
					: colors.primary
			}
			// Label color
			labelStyle={{
				color:
					Platform.OS === "ios"
						? DynamicColorIOS({
								dark: colors.textTertiary,
								light: colors.textTertiary,
							})
						: colors.textTertiary,
			}}
			// Tab bar background color - always applied as fallback
			backgroundColor={backgroundColor}
		>
			<NativeTabs.Trigger name="home">
				<Label hidden />
				{Platform.OS === "ios" ? (
					<Icon sf={{ default: "house", selected: "house.fill" }} />
				) : (
					<Icon src={<VectorIcon family={MaterialIcons} name="home" />} />
				)}
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="groups">
				<Label hidden />
				{Platform.OS === "ios" ? (
					<Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
				) : (
					<Icon src={<VectorIcon family={MaterialIcons} name="groups" />} />
				)}
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="profile">
				<Label hidden />
				{Platform.OS === "ios" ? (
					<Icon sf={{ default: "person", selected: "person.fill" }} />
				) : (
					<Icon src={<VectorIcon family={MaterialIcons} name="person" />} />
				)}
			</NativeTabs.Trigger>

			{/* Settings tab is hidden - not accessible via tab bar */}
			<NativeTabs.Trigger name="settings" hidden />
		</NativeTabs>
	);
}
