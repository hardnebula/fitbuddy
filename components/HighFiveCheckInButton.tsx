import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import SquircleView from '@/components/SquircleView';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/constants/Theme';

const mascot = require('../assets/images/Teo High Five-Photoroom.png');

// Helper to calculate time until midnight
function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, totalMs: diff };
}

// Helper to calculate progress through the day (0 to 1)
function getDayProgress() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  
  const elapsed = now.getTime() - startOfDay.getTime();
  const totalDay = 24 * 60 * 60 * 1000;
  
  return elapsed / totalDay;
}

interface HighFiveCheckInButtonProps {
  onPress: () => void;
  disabled?: boolean;
  hasCheckedIn?: boolean;
}

export const HighFiveCheckInButton: React.FC<HighFiveCheckInButtonProps> = ({
  onPress,
  disabled = false,
  hasCheckedIn = false,
}) => {
  const { colors, isDark } = useTheme();
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());
  const [progress, setProgress] = useState(getDayProgress());
  
  // Update timer every minute when checked in
  useEffect(() => {
    if (!hasCheckedIn) return;
    
    const updateTimer = () => {
      setTimeLeft(getTimeUntilMidnight());
      setProgress(getDayProgress());
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [hasCheckedIn]);
  
  // Animation values
  const scale = useSharedValue(1);
  const mascotScale = useSharedValue(1);
  const mascotRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const handlePressIn = () => {
    if (disabled) return;
    
    // Micro-bounce on press
    scale.value = withTiming(0.96, {
      duration: 80,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    if (disabled) return;

    // Bounce back with overshoot
    scale.value = withSequence(
      withTiming(1.04, { duration: 60, easing: Easing.out(Easing.cubic) }),
      withSpring(1.0, { damping: 12, stiffness: 200 })
    );

    // Mascot celebration animation - bounce and rotate
    mascotScale.value = withSequence(
      withSpring(1.15, { damping: 8, stiffness: 300 }),
      withSpring(1.0, { damping: 10, stiffness: 200 })
    );
    
    mascotRotate.value = withSequence(
      withTiming(-8, { duration: 100, easing: Easing.out(Easing.cubic) }),
      withTiming(8, { duration: 100, easing: Easing.inOut(Easing.cubic) }),
      withTiming(0, { duration: 100, easing: Easing.in(Easing.cubic) })
    );

    // Ripple effect
    rippleScale.value = 0;
    rippleOpacity.value = 0.2;
    rippleScale.value = withTiming(3, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    rippleOpacity.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    // Glow effect
    glowOpacity.value = withSequence(
      withTiming(0.2, { duration: 100 }),
      withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
    );

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePress = () => {
    if (disabled) return;
    onPress();
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: mascotScale.value },
      { rotate: `${mascotRotate.value}deg` },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[styles.pressable, disabled && styles.disabled]}
    >
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
          <SquircleView
            style={[
              styles.clayContainer,
              { 
                backgroundColor: colors.card,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.border
              },
            ]}
            cornerSmoothing={1.0}
          >
            {/* Content - rendered first so it's on top */}
            <View style={styles.content}>
            {/* Mascot - ensure it's on top layer */}
            <Animated.View style={[styles.mascotContainer, mascotAnimatedStyle]}>
              <Image
                source={mascot}
                style={styles.mascot}
                contentFit="contain"
                transition={200}
                cachePolicy="memory-disk"
                priority="high"
              />
            </Animated.View>

            {/* Text content */}
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>
                {hasCheckedIn ? "You crushed it! 💪" : "High five to check in"}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {hasCheckedIn 
                  ? `Next check-in in ${timeLeft.hours}h ${timeLeft.minutes}m`
                  : "Your group is counting on you"}
              </Text>
              
              {/* Progress bar - only show when checked in */}
              {hasCheckedIn && (
                <View style={styles.progressContainer}>
                  <View 
                    style={[
                      styles.progressBackground,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        { 
                          width: `${progress * 100}%`,
                          backgroundColor: colors.primary
                        }
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Ripple effect - behind content */}
          <Animated.View
            style={[
              styles.ripple,
              { backgroundColor: colors.primary },
              rippleAnimatedStyle,
            ]}
          />

          {/* Glow overlay - behind content */}
          <Animated.View style={[styles.glowOverlay, glowAnimatedStyle]} />
        </SquircleView>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  clayContainer: {
    width: '100%',
    overflow: 'hidden',
    // Soft shadows for claymorphism
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    top: '50%',
    marginTop: -50,
    zIndex: 1,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 18,
    minHeight: 110,
    zIndex: 10,
    position: 'relative',
  },
  mascotContainer: {
    zIndex: 11,
  },
  mascot: {
    width: 96,
    height: 96,
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
