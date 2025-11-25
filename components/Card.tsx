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
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  glow: {
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});

