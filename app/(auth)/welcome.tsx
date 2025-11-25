import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { Theme } from '../../constants/Theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Logo size={120} style={styles.logo} />
              <Text style={styles.title}>FitBuddy</Text>
              <Text style={styles.subtitle}>
                Stay accountable with your group
              </Text>
            </View>

            <View style={styles.actions}>
              <Button
                title="Create Account"
                onPress={() => router.push('/(auth)/create-group')}
                fullWidth
                size="large"
              />

              <Button
                title="Join with Code"
                onPress={() => router.push('/(auth)/join-group')}
                variant="outline"
                fullWidth
                size="large"
                style={styles.joinButton}
              />
            </View>

            <View style={styles.social}>
              <Text style={styles.socialText}>Or continue with</Text>
              <View style={styles.socialButtons}>
                <Button
                  title="Apple"
                  onPress={() => {}}
                  variant="outline"
                  style={styles.socialButton}
                />
                <Button
                  title="Google"
                  onPress={() => {}}
                  variant="outline"
                  style={styles.socialButton}
                />
              </View>
            </View>

            <Text style={styles.footer}>
              By continuing, you agree to our{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: Theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl * 2,
  },
  logo: {
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.fontSize['4xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
    marginBottom: Theme.spacing.md,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.lg,
    color: '#666666',
    textAlign: 'center',
  },
  actions: {
    marginBottom: Theme.spacing.xl,
  },
  joinButton: {
    marginTop: Theme.spacing.md,
  },
  social: {
    marginTop: Theme.spacing.xl,
    alignItems: 'center',
  },
  socialText: {
    fontSize: Theme.typography.fontSize.sm,
    color: '#999999',
    marginBottom: Theme.spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    width: '100%',
  },
  socialButton: {
    flex: 1,
  },
  footer: {
    marginTop: Theme.spacing.xl,
    fontSize: Theme.typography.fontSize.xs,
    color: '#999999',
    textAlign: 'center',
  },
  link: {
    color: '#8B5CF6',
  },
});

