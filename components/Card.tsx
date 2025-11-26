import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../constants/Theme';
import { useTheme } from '../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, glow = false }) => {
  const { colors } = useTheme();
  
  return (
    <View
      style={[
        styles.card,
        { borderColor: colors.border },
        glow && { borderColor: colors.primary, shadowColor: colors.primary },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});

