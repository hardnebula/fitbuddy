import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../constants/Theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, glow = false }) => {
  return (
    <View
      style={[
        styles.card,
        glow && styles.glow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  glow: {
    borderColor: Theme.colors.accent,
    ...Theme.shadows.glow,
  },
});

