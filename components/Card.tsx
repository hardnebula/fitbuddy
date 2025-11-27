import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import SquircleView from '@/components/SquircleView';
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
    <SquircleView
      style={[
        styles.card,
        { borderColor: colors.border, borderRadius: 24 },
        glow && { borderColor: colors.primary, shadowColor: colors.primary },
        style,
      ]}
      cornerSmoothing={1.0}
    >
      {children}
    </SquircleView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Theme.spacing.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});

