import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

interface AnimatedTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ children, style }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Efecto de rebote sutil al montar
    scale.value = withSequence(
      withSpring(1.05, {
        damping: 8,
        stiffness: 100,
      }),
      withSpring(1, {
        damping: 10,
        stiffness: 100,
      })
    );

    translateY.value = withSequence(
      withSpring(-3, {
        damping: 8,
        stiffness: 100,
      }),
      withSpring(0, {
        damping: 10,
        stiffness: 100,
      })
    );
  }, [children]); // Se reactiva cuando cambia el texto

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {children}
    </Animated.Text>
  );
};
