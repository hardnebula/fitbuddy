import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LoadingSpinner } from '../components';
import { Theme } from '../constants/Theme';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // In a real app, check authentication status here
    // For now, redirect to welcome screen
    setTimeout(() => {
      router.replace('/(auth)/welcome');
    }, 500);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          animation: 'none',
        }}
      />
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
});

