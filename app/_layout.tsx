import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ConvexProvider } from '../lib/convex';
import { convexClient } from '../lib/convex';
import { AuthProvider } from '../contexts/AuthContext';
import { Theme } from '../constants/Theme';

export default function RootLayout() {
  return (
    <ConvexProvider client={convexClient}>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Theme.colors.background,
            },
            headerTintColor: Theme.colors.text,
            headerTitleStyle: {
              fontWeight: Theme.typography.fontWeight.bold,
            },
            contentStyle: {
              backgroundColor: Theme.colors.background,
            },
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </ConvexProvider>
  );
}

