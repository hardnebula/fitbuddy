import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../constants/Theme';
import { useTheme } from '../contexts/ThemeContext';

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  submessage?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message,
  submessage,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      {submessage && (
        <Text style={[styles.submessage, { color: colors.textSecondary }]}>
          {submessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: Theme.spacing.lg,
  },
  message: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  submessage: {
    fontSize: Theme.typography.fontSize.base,
    textAlign: 'center',
  },
});

