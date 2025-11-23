import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Theme } from '../constants/Theme';

interface StreakBadgeProps {
  days: number;
  size?: 'small' | 'medium' | 'large';
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  days,
  size = 'medium',
}) => {
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      shadowOpacity: glow.value,
    };
  });

  const textStyle = [
    styles.text,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`],
  ];

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={textStyle}>
        {days} days 🔥
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...Theme.shadows.glow,
  },
  text: {
    color: Theme.colors.accent,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  textSmall: {
    fontSize: Theme.typography.fontSize.base,
  },
  textMedium: {
    fontSize: Theme.typography.fontSize.lg,
  },
  textLarge: {
    fontSize: Theme.typography.fontSize.xl,
  },
});

