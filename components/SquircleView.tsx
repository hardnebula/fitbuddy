import React from 'react';
import { View, ViewStyle, Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if we're in Expo Go (where custom native modules don't work)
// Expo Go has executionEnvironment === 'storeClient'
// Development builds have executionEnvironment === 'standalone' or undefined
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Lazy load the native module only when needed (not in Expo Go)
let NativeSquircleView: any = null;
let isNativeAvailable = false;
let hasTriedToLoad = false;

function tryLoadNativeModule() {
  if (hasTriedToLoad) return;
  hasTriedToLoad = true;
  
  if (isExpoGo || Platform.OS === 'web') {
    return;
  }
  
  try {
    // Use a function to delay the require until runtime
    const module = require('react-native-fast-squircle');
    if (module && module.default) {
      NativeSquircleView = module.default;
      isNativeAvailable = true;
    }
  } catch (e) {
    // Native module not available
    isNativeAvailable = false;
  }
}

interface SquircleViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  cornerSmoothing?: number;
  [key: string]: any; // Allow other props to pass through
}

/**
 * SquircleView wrapper that falls back to regular View when native module isn't available.
 * This allows the app to work in Expo Go while using native squircle shapes in development builds.
 */
export default function SquircleView({
  children,
  style,
  cornerSmoothing = 0.6,
  ...otherProps
}: SquircleViewProps) {
  // Always use regular View in Expo Go
  if (isExpoGo) {
    return (
      <View style={style} {...otherProps}>
        {children}
      </View>
    );
  }

  // Try to load native module on first render (only in development builds)
  if (!hasTriedToLoad) {
    tryLoadNativeModule();
  }

  // If native module isn't available, use regular View
  if (!isNativeAvailable || !NativeSquircleView) {
    return (
      <View style={style} {...otherProps}>
        {children}
      </View>
    );
  }

  // Use native SquircleView only in development builds
  try {
    return (
      <NativeSquircleView
        style={style}
        cornerSmoothing={cornerSmoothing}
        {...otherProps}
      >
        {children}
      </NativeSquircleView>
    );
  } catch (e) {
    // If native component fails, fallback to View
    return (
      <View style={style} {...otherProps}>
        {children}
      </View>
    );
  }
}

