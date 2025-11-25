import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../constants/Theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    // Haptic feedback leve
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  const buttonStyle = [
    styles.base,
    styles[size],
    fullWidth && styles.fullWidth,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textSizeStyle = size === 'small' ? styles.textSmall : size === 'large' ? styles.textLarge : styles.textMedium;
  
  const buttonTextStyle = [
    styles.text,
    textSizeStyle,
    variant === 'outline' && styles.outlineText,
    variant === 'ghost' && styles.ghostText,
    textStyle,
  ];

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        <Animated.View style={[buttonStyle, { overflow: 'hidden' }, animatedStyle]}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={buttonTextStyle}>{title}</Text>
          )}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View style={[buttonStyle, animatedStyle]}>
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' ? '#8B5CF6' : '#FFFFFF'}
          />
        ) : (
          <Text style={buttonTextStyle}>{title}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Theme.touchTarget.minHeight,
  },
  small: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    minHeight: 40,
  },
  medium: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  large: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    minHeight: 56,
  },
  fullWidth: {
    width: '100%',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  textSmall: {
    fontSize: Theme.typography.fontSize.sm,
  },
  textMedium: {
    fontSize: Theme.typography.fontSize.base,
  },
  textLarge: {
    fontSize: Theme.typography.fontSize.lg,
  },
  outlineText: {
    color: '#8B5CF6',
  },
  ghostText: {
    color: '#8B5CF6',
  },
});

