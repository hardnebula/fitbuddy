import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Theme } from '../constants/Theme';
import { useTheme } from '../contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderWidth = useSharedValue(1);
  const scale = useSharedValue(1);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderWidth.value = withTiming(2, { duration: 200 });
    scale.value = withTiming(1.01, { duration: 200 });
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderWidth.value = withTiming(1, { duration: 200 });
    scale.value = withTiming(1, { duration: 200 });
    props.onBlur?.(e);
  };

  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      borderWidth: borderWidth.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <AnimatedTextInput
        style={[
          styles.input,
          animatedInputStyle,
          {
            backgroundColor: colors.cardSecondary,
            borderColor: isFocused
              ? colors.primary
              : error
              ? colors.error
              : colors.border,
            color: colors.text,
          },
          style,
        ]}
        placeholderTextColor={colors.textTertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    marginBottom: Theme.spacing.sm,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.base,
    minHeight: 56,
    fontWeight: Theme.typography.fontWeight.normal,
  },
  errorText: {
    fontSize: Theme.typography.fontSize.xs,
    marginTop: Theme.spacing.xs,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

