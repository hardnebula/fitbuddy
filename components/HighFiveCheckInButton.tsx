import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Video, ResizeMode } from 'expo-av';

const mascot = require('../assets/images/Teo High Five-Photoroom.png');
const buttonAnimation = require('../assets/videos/Button animation.mp4');

interface HighFiveCheckInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const HighFiveCheckInButton: React.FC<HighFiveCheckInButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  const videoRef = useRef<Video>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // Animation values
  const scale = useSharedValue(1);
  const handTranslateX = useSharedValue(0);
  const mascotTranslateX = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  
  // Spark animations
  const spark1Scale = useSharedValue(0.4);
  const spark1Opacity = useSharedValue(0);
  const spark2Scale = useSharedValue(0.4);
  const spark2Opacity = useSharedValue(0);
  const spark3Scale = useSharedValue(0.4);
  const spark3Opacity = useSharedValue(0);

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

    // Hand slap animation
    handTranslateX.value = withSequence(
      withTiming(-12, { duration: 120, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 120, easing: Easing.inOut(Easing.cubic) })
    );

    mascotTranslateX.value = withSequence(
      withTiming(8, { duration: 120, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 120, easing: Easing.inOut(Easing.cubic) })
    );

    // Glow effect
    glowOpacity.value = withSequence(
      withTiming(0.15, { duration: 50 }),
      withTiming(0, { duration: 150, easing: Easing.out(Easing.cubic) })
    );

    // Spark 1
    spark1Scale.value = 0.4;
    spark1Opacity.value = 1;
    spark1Scale.value = withTiming(1.2, { duration: 220, easing: Easing.out(Easing.cubic) });
    spark1Opacity.value = withDelay(
      100,
      withTiming(0, { duration: 120, easing: Easing.out(Easing.cubic) })
    );

    // Spark 2 (slightly delayed)
    spark2Scale.value = 0.4;
    spark2Opacity.value = 1;
    spark2Scale.value = withDelay(
      20,
      withTiming(1.2, { duration: 200, easing: Easing.out(Easing.cubic) })
    );
    spark2Opacity.value = withDelay(
      120,
      withTiming(0, { duration: 100, easing: Easing.out(Easing.cubic) })
    );

    // Spark 3 (more delayed)
    spark3Scale.value = 0.4;
    spark3Opacity.value = 1;
    spark3Scale.value = withDelay(
      40,
      withTiming(1.2, { duration: 240, easing: Easing.out(Easing.cubic) })
    );
    spark3Opacity.value = withDelay(
      140,
      withTiming(0, { duration: 120, easing: Easing.out(Easing.cubic) })
    );

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePress = async () => {
    if (disabled) return;
    
    // Mostrar y reproducir el video
    setShowVideo(true);
    if (videoRef.current && isVideoLoaded) {
      try {
        await videoRef.current.setPositionAsync(0);
        await videoRef.current.playAsync();
      } catch (error) {
        console.log('Error playing video:', error);
      }
    }
    
    onPress();
  };

  const handleVideoEnd = () => {
    // Ocultar el video cuando termine
    setShowVideo(false);
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: handTranslateX.value }],
  }));

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: mascotTranslateX.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const spark1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: spark1Scale.value }],
    opacity: spark1Opacity.value,
  }));

  const spark2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: spark2Scale.value }],
    opacity: spark2Opacity.value,
  }));

  const spark3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: spark3Scale.value }],
    opacity: spark3Opacity.value,
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
        {/* Video overlay - siempre montado pero oculto hasta que se presiona */}
        <View style={[styles.videoOverlay, !showVideo && styles.videoHidden]}>
          <Video
            ref={videoRef}
            source={buttonAnimation}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping={false}
            isMuted={true}
            onLoad={() => setIsVideoLoaded(true)}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && status.didJustFinish) {
                handleVideoEnd();
              }
            }}
          />
        </View>
        
        <LinearGradient
          colors={['#3B82F6', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {/* Glow overlay */}
          <Animated.View style={[styles.glowOverlay, glowAnimatedStyle]} />

          {/* Mascot */}
          <Animated.Image
            source={mascot}
            style={[styles.mascot, mascotAnimatedStyle]}
            resizeMode="contain"
          />

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>High five to check in</Text>
            <Text style={styles.subtitle}>Your group is counting on you</Text>
          </View>

          {/* Hand icon container with sparks */}
          <View style={styles.handContainer}>
            <Animated.View style={[styles.handCircle, handAnimatedStyle]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M7 11V7C7 5.89543 7.89543 5 9 5C10.1046 5 11 5.89543 11 7M11 7V3C11 1.89543 11.8954 1 13 1C14.1046 1 15 1.89543 15 3V7M11 7V11M15 7V11M15 7V5C15 3.89543 15.8954 3 17 3C18.1046 3 19 3.89543 19 5V11M19 11V13C19 17.4183 15.4183 21 11 21H10C6.68629 21 4 18.3137 4 15V13C4 11.8954 4.89543 11 6 11C7.10457 11 8 11.8954 8 13"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Animated.View>

            {/* Sparks */}
            <Animated.View style={[styles.spark, styles.spark1, spark1AnimatedStyle]} />
            <Animated.View style={[styles.spark, styles.spark2, spark2AnimatedStyle]} />
            <Animated.View style={[styles.spark, styles.spark3, spark3AnimatedStyle]} />
          </View>
        </LinearGradient>
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
    borderRadius: 24,
    overflow: 'hidden',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    borderRadius: 24,
    overflow: 'hidden',
  },
  videoHidden: {
    opacity: 0,
    zIndex: -1,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  mascot: {
    width: 80,
    height: 80,
    opacity: 0.9,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.85,
  },
  handContainer: {
    position: 'relative',
    width: 32,
    height: 32,
  },
  handCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  spark1: {
    top: 8,
    left: -4,
  },
  spark2: {
    top: 4,
    left: -2,
  },
  spark3: {
    top: 12,
    left: -6,
  },
});
