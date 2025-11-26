import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export default function AuthLayout() {
  const { colors } = useTheme();
  
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: {
        backgroundColor: colors.background,
      },
    }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="join-group" />
      <Stack.Screen name="create-group" />
    </Stack>
  );
}

