import React from 'react';
import { View, StyleSheet, ViewStyle, Image } from 'react-native';

interface LogoProps {
  size?: number;
  style?: ViewStyle;
}

export function Logo({ size = 64, style }: LogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image 
        source={require('../assets/images/Logo-teo.png')} 
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

