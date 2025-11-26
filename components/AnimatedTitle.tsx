import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

interface AnimatedTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ children, style }) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(30);
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger animation on focus
  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey(prev => prev + 1);
    }, [])
  );

  useEffect(() => {
    // Reset and animate
    opacity.value = 0;
    translateX.value = 30;
    
    // Efecto de swipe horizontal con fade
    opacity.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });

    translateX.value = withSpring(0, {
      damping: 15,
      stiffness: 90,
      mass: 0.8,
    });
  }, [animationKey, children]); // Se reactiva cuando cambia el texto o la pantalla

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
      ],
    };
  });

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {children}
    </Animated.Text>
  );
};
