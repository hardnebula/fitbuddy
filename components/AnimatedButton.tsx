import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Theme } from '../constants/Theme';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  haptic?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  haptic = true,
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: glow.value,
    };
  });

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.95);
    glow.value = withTiming(0.6, { duration: 100 });
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1);
    glow.value = withSequence(
      withTiming(0.8, { duration: 150 }),
      withTiming(0, { duration: 200 })
    );
  };

  const handlePress = () => {
    if (disabled) return;
    scale.value = withSequence(
      withSpring(0.95, { damping: 2 }),
      withSpring(1, { damping: 2 })
    );
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedTouchable>
  );
};

