import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SquircleView from '@/components/SquircleView';
import { StreakBadge } from '@/components/StreakBadge';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';

interface StreakSectionProps {
  userStreak: number;
  groupStreak: number;
}

export function StreakSection({ userStreak, groupStreak }: StreakSectionProps) {
  const { colors, isDark } = useTheme();

  return (
    <SquircleView
      style={[
        styles.streakSection,
        { 
          borderRadius: 24,
          borderColor: colors.primary,
          borderWidth: 1.5
        },
      ]}
      cornerSmoothing={1.0}
    >
      <LinearGradient
        colors={
          isDark
            ? ['rgba(139, 92, 246, 0.25)', 'rgba(139, 92, 246, 0.1)']
            : ['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.content}>
        <View style={styles.streakItem}>
          <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
            Your Streak
          </Text>
          <StreakBadge days={userStreak} size="medium" />
        </View>
        
        <View style={[styles.streakDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />
        
        <View style={styles.streakItem}>
          <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
            Group Streak
          </Text>
          <StreakBadge days={groupStreak} size="small" />
        </View>
      </View>
    </SquircleView>
  );
}

const styles = StyleSheet.create({
  streakSection: {
    marginBottom: Theme.spacing.xl,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  streakDivider: {
    width: 1,
    height: '80%',
    marginHorizontal: Theme.spacing.md,
  },
});

