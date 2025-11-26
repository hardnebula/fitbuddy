import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

interface ScreenTransitionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children, style }) => {
  const { colors } = useTheme();
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  // Ejecutar animación cada vez que la pantalla obtiene foco
  useFocusEffect(
    React.useCallback(() => {
      // Reset values
      opacity.value = 1;
      translateX.value = 0;
      
      // No animation to prevent flash
    }, [])
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: colors.background }, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
