import { Platform, DynamicColorIOS } from 'react-native';
import { NativeTabs, Icon, Label, VectorIcon } from 'expo-router/unstable-native-tabs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <NativeTabs
      // Selected tab icon color
      tintColor={Platform.select({
        ios: DynamicColorIOS({
          dark: colors.primary,
          light: colors.primary,
        }),
        android: colors.primary,
      })}
      // Label color
      labelStyle={{
        color: Platform.select({
          ios: DynamicColorIOS({
            dark: colors.textTertiary,
            light: colors.textTertiary,
          }),
          android: colors.textTertiary,
        }),
      }}
      // Tab bar background color
      barTintColor={colors.surface}
    >
      <NativeTabs.Trigger name="home">
        <Label hidden />
        {Platform.OS === 'ios' ? (
          <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        ) : (
          <Icon src={<VectorIcon family={MaterialIcons} name="home" />} />
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="groups">
        <Label hidden />
        {Platform.OS === 'ios' ? (
          <Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} />
        ) : (
          <Icon src={<VectorIcon family={MaterialIcons} name="groups" />} />
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label hidden />
        {Platform.OS === 'ios' ? (
          <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        ) : (
          <Icon src={<VectorIcon family={MaterialIcons} name="person" />} />
        )}
      </NativeTabs.Trigger>

      {/* Settings tab is hidden - not accessible via tab bar */}
      <NativeTabs.Trigger name="settings" hidden />
    </NativeTabs>
  );
}

