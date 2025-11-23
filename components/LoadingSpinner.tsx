import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Theme } from '../constants/Theme';

export const LoadingSpinner: React.FC<{ size?: 'small' | 'large' }> = ({
  size = 'large',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={Theme.colors.primary} />
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

