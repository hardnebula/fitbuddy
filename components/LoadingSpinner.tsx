import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Theme } from '../constants/Theme';
import { useTheme } from '../contexts/ThemeContext';

export const LoadingSpinner: React.FC<{ size?: 'small' | 'large' }> = ({
  size = 'large',
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

