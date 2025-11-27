import React, { useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface SwipeableTabViewProps {
  children: React.ReactNode;
  currentTab: 'home' | 'groups' | 'profile';
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

const TAB_ORDER: ('home' | 'groups' | 'profile')[] = ['home', 'groups', 'profile'];

export function SwipeableTabView({
  children,
  currentTab,
  onSwipeStart,
  onSwipeEnd,
}: SwipeableTabViewProps) {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isGestureActive = useSharedValue(false);
  const hasTriggeredHaptic = useSharedValue(false);
  const gestureDirection = useSharedValue<'horizontal' | 'vertical' | null>(null);

  const getTabIndex = (tab: string) => {
    return TAB_ORDER.indexOf(tab as any);
  };

  const navigateToTab = useCallback((direction: 'left' | 'right') => {
    try {
      const currentIndex = getTabIndex(currentTab);
      let nextIndex: number;

      if (direction === 'left' && currentIndex < TAB_ORDER.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (direction === 'right' && currentIndex > 0) {
        nextIndex = currentIndex - 1;
      } else {
        return;
      }

      const nextTab = TAB_ORDER[nextIndex];
      if (nextTab) {
        router.push(`/(tabs)/${nextTab}` as any);
        
        // Haptic feedback
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [currentTab, router]);

  // Store current tab index in a shared value to avoid prop access in gesture handlers
  const currentTabIndex = useSharedValue(getTabIndex(currentTab));
  
  useEffect(() => {
    currentTabIndex.value = getTabIndex(currentTab);
  }, [currentTab]);

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .onBegin(() => {
        startX.value = 0;
        startY.value = 0;
        isGestureActive.value = true;
        hasTriggeredHaptic.value = false;
        gestureDirection.value = null;
        
        if (onSwipeStart) {
          runOnJS(onSwipeStart)();
        }
      })
      .onUpdate((event) => {
        const deltaX = event.translationX;
        const deltaY = event.translationY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Determine gesture direction on first significant movement
        if (gestureDirection.value === null) {
          if (absDeltaX > 15 && absDeltaX > absDeltaY * 1.8) {
            gestureDirection.value = 'horizontal';
          } else if (absDeltaY > 15 && absDeltaY > absDeltaX * 1.8) {
            gestureDirection.value = 'vertical';
            // Reset translation and cancel gesture if vertical scrolling is detected
            translateX.value = withSpring(0, {
              damping: 25,
              stiffness: 400,
              mass: 0.5,
            });
            isGestureActive.value = false;
            hasTriggeredHaptic.value = false;
            gestureDirection.value = null;
            return;
          }
        }

        // Only process horizontal gestures
        if (gestureDirection.value === 'horizontal' && absDeltaX > absDeltaY * 1.5) {
          const index = currentTabIndex.value;
          
          // Calculate translation with resistance at edges
          let translation = deltaX;
          const maxTranslation = screenWidth * 0.35;
          
          if (deltaX > 0 && index > 0) {
            // Swiping right (going to previous tab)
            translation = Math.min(deltaX, maxTranslation);
          } else if (deltaX < 0 && index < TAB_ORDER.length - 1) {
            // Swiping left (going to next tab)
            translation = Math.max(deltaX, -maxTranslation);
          } else {
            // At edge, add resistance
            translation = deltaX * 0.3;
          }

          translateX.value = translation;

          // Trigger haptic feedback at threshold
          if (absDeltaX > 60 && !hasTriggeredHaptic.value) {
            hasTriggeredHaptic.value = true;
            if (Platform.OS === 'ios') {
              runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        }
      })
      .onEnd((event) => {
        const deltaX = event.translationX;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(event.translationY);
        const velocityX = event.velocityX;
        const absVelocityX = Math.abs(velocityX);

        // Only process if gesture was horizontal
        if (gestureDirection.value === 'horizontal' && absDeltaX > absDeltaY * 1.5) {
          // Thresholds for triggering navigation
          const SWIPE_THRESHOLD = 100; // Minimum distance
          const VELOCITY_THRESHOLD = 600; // Minimum velocity

          const shouldNavigate =
            absDeltaX > SWIPE_THRESHOLD || absVelocityX > VELOCITY_THRESHOLD;

          if (shouldNavigate) {
            if (deltaX > 0) {
              // Swiped right - go to previous tab
              runOnJS(navigateToTab)('right');
            } else {
              // Swiped left - go to next tab
              runOnJS(navigateToTab)('left');
            }
          }
        }

        // Always reset animation, even if navigation didn't happen
        translateX.value = withSpring(0, {
          damping: 25,
          stiffness: 400,
          mass: 0.5,
        });

        if (onSwipeEnd) {
          runOnJS(onSwipeEnd)();
        }
      })
      .onFinalize(() => {
        // Cleanup - called when gesture ends, fails, or is cancelled
        isGestureActive.value = false;
        hasTriggeredHaptic.value = false;
        gestureDirection.value = null;
      })
      .activeOffsetX([-15, 15]) // Only activate after 15px horizontal movement
      .failOffsetY([-20, 20]); // Fail if vertical movement exceeds 20px before horizontal
  }, [navigateToTab, onSwipeStart, onSwipeEnd, screenWidth, currentTabIndex]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: isGestureActive.value 
        ? Math.max(0.95, 1 - Math.abs(translateX.value) / (screenWidth * 0.5))
        : 1,
    };
  });

  // Reset translation when tab changes
  useEffect(() => {
    translateX.value = 0;
    isGestureActive.value = false;
    gestureDirection.value = null;
  }, [currentTab]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
