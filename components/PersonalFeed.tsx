import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { AnimatedTitle } from '@/components/AnimatedTitle';
import { CheckInFeedItem } from '@/components/CheckInFeedItem';
import SquircleView from '@/components/SquircleView';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import { CheckIn } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';

interface PersonalFeedProps {
  checkIns: CheckIn[];
  totalCheckIns: number;
  bestStreak: number;
  onCheckInPress?: (checkIn: CheckIn) => void;
  onRefresh?: () => void;
}

export function PersonalFeed({
  checkIns,
  totalCheckIns,
  bestStreak,
  onCheckInPress,
  onRefresh,
}: PersonalFeedProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.feedSection}>
      <AnimatedTitle
        style={StyleSheet.flatten([
          styles.feedTitle,
          { color: colors.text },
        ])}
      >
        Your Activity
      </AnimatedTitle>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <SquircleView
          style={[styles.statCard, { borderColor: colors.primary, borderWidth: 1.5 }]}
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
          <View style={styles.statCardContent}>
            <Text style={[styles.statValue, { color: colors.primary, textShadowColor: colors.primary, textShadowRadius: 10 }]}>
              {totalCheckIns}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Check-ins
            </Text>
          </View>
        </SquircleView>

        <SquircleView
          style={[styles.statCard, { borderColor: colors.primary, borderWidth: 1.5 }]}
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
          <View style={styles.statCardContent}>
            <Text style={[styles.statValue, { color: colors.primary, textShadowColor: colors.primary, textShadowRadius: 10 }]}>
              {bestStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Best Streak 🔥
            </Text>
          </View>
        </SquircleView>
      </View>

      {/* Recent Check-ins */}
      {checkIns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('@/assets/images/Teo sleeping.png')}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Start Your Journey
          </Text>
          <Text
            style={[
              styles.emptyMessage,
              { color: colors.textSecondary },
            ]}
          >
            Check in today to begin building your streak! 💪
          </Text>
        </View>
      ) : (
        <View style={styles.checkInsList}>
          {checkIns.slice(0, 5).map((checkIn) => (
            <CheckInFeedItem
              key={checkIn.id}
              checkIn={checkIn}
              onPress={() => onCheckInPress?.(checkIn)}
              onDeleted={onRefresh}
              onEdited={onRefresh}
            />
          ))}
          {checkIns.length > 5 && (
            <Text
              style={[
                styles.moreText,
                { color: colors.textTertiary },
              ]}
            >
              +{checkIns.length - 5} more check-ins
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  feedSection: {
    marginTop: Theme.spacing.lg,
  },
  feedTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    minHeight: 100,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    borderRadius: 24,
  },
  statCardContent: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statValue: {
    fontSize: 32,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  checkInsList: {
    gap: Theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxl * 2,
    paddingHorizontal: Theme.spacing.xl,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: Theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: Theme.typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  moreText: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
    fontStyle: 'italic',
  },
});

