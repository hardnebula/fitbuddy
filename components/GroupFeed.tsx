import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { AnimatedTitle } from '@/components/AnimatedTitle';
import { CheckInFeedItem } from '@/components/CheckInFeedItem';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import { CheckIn } from '@/types';

interface GroupFeedProps {
  checkIns: CheckIn[] | undefined;
  onCheckInPress?: (checkIn: CheckIn) => void;
  onRefresh?: () => void;
}

export function GroupFeed({ checkIns, onCheckInPress, onRefresh }: GroupFeedProps) {
  const { colors } = useTheme();

  if (checkIns === undefined) {
    return null; // Loading state handled by parent
  }

  return (
    <View style={styles.feedSection}>
      <AnimatedTitle
        style={StyleSheet.flatten([
          styles.feedTitle,
          { color: colors.text },
        ])}
      >
        Group Feed
      </AnimatedTitle>
      {checkIns.length === 0 ? (
        <View style={styles.emptyFeedContainer}>
          <Image
            source={require('@/assets/images/Teo sleeping.png')}
            style={styles.emptyFeedImage}
            resizeMode="contain"
          />
          <Text style={[styles.emptyFeedTitle, { color: colors.text }]}>
            No activity yet
          </Text>
          <Text
            style={[
              styles.emptyFeedMessage,
              { color: colors.textSecondary },
            ]}
          >
            Be the first to check in today! 💪
          </Text>
        </View>
      ) : (
        checkIns.map((checkIn) => (
          <CheckInFeedItem
            key={checkIn.id}
            checkIn={checkIn}
            onPress={() => onCheckInPress?.(checkIn)}
            onDeleted={onRefresh}
            onEdited={onRefresh}
          />
        ))
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
  emptyFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxl * 2,
    paddingHorizontal: Theme.spacing.xl,
  },
  emptyFeedImage: {
    width: 150,
    height: 150,
    marginBottom: Theme.spacing.lg,
  },
  emptyFeedTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  emptyFeedMessage: {
    fontSize: Theme.typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
});

