import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SquircleView from '@/components/SquircleView';
import Svg, { Path } from 'react-native-svg';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface NoGroupViewProps {
  onCreateGroup: () => void;
}

export function NoGroupView({ onCreateGroup }: NoGroupViewProps) {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const handleCreateGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCreateGroup();
  };

  const handleJoinGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/join-group' as any);
  };

  return (
    <SquircleView
      style={[styles.card, { borderColor: colors.border, borderRadius: 24 }]}
      cornerSmoothing={1.0}
    >
      <LinearGradient
        colors={
          isDark
            ? ['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']
            : ['rgba(139, 92, 246, 0.08)', 'rgba(139, 92, 246, 0.03)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Start Your Fitness Journey Together
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Create or join a group to stay motivated and accountable with friends
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateGroup}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>+ Create Group</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              onPress={handleJoinGroup}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                Join Group
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SquircleView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Theme.spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: Theme.spacing.md,
  },
  primaryButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  secondaryButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
});

