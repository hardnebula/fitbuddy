import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/constants/Theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  SlideInDown,
  ZoomIn,
  FadeOut,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 8000;

interface StoryModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  userPhoto?: string;
  photo?: string;
  note?: string;
  timestamp: Date;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  visible,
  onClose,
  userName,
  userPhoto,
  photo,
  note,
  timestamp,
}) => {
  const { colors } = useTheme();

  // Shared values
  const progress = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);

  // Start timer on mount
  useEffect(() => {
    if (visible) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: STORY_DURATION,
        easing: Easing.linear,
      }, (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      });
    }
    return () => {
      cancelAnimation(progress);
    };
  }, [visible]);

  // Gestures
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow dragging down
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        // Scale down slightly as we drag down, similar to Instagram
        scale.value = interpolate(
          e.translationY,
          [0, SCREEN_HEIGHT],
          [1, 0.8],
          Extrapolation.CLAMP
        );
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        // Close if dragged far enough or fast enough
        runOnJS(onClose)();
      } else {
        // Snap back
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        scale.value = withSpring(1, { damping: 20, stiffness: 200 });
      }
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      isPressed.value = true;
      // Pause timer (technically we just cancel and we'd need to resume, 
      // but for simple implementation we can just cancel or let it run. 
      // A true pause requires tracking elapsed time. 
      // For now, let's just do the visual "hold" effect without complex timer pause logic 
      // unless requested, as re-starting from current progress is a bit involved with simple withTiming)
      // Actually, let's just pause the progress bar visual if we can.
      // cancelAnimation(progress); 
    })
    .onEnd(() => {
      isPressed.value = false;
      // Resume logic would go here
    });

  // Composed gesture
  // We prioritize pan for swipe down, but maybe just use Pan for everything?
  // Simpler to just use Pan for swipe down.
  const gesture = panGesture;

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    borderRadius: interpolate(
      translateY.value,
      [0, 200],
      [0, 40],
      Extrapolation.CLAMP
    ),
    overflow: 'hidden',
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT / 2],
      [1, 0],
      Extrapolation.CLAMP
    ),
    backgroundColor: 'black',
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        
        <GestureDetector gesture={gesture}>
          <Animated.View 
            style={[styles.container, containerStyle]}
            entering={SlideInDown.duration(250)}
            exiting={FadeOut}
          >
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <Animated.View style={[styles.progressBarFill, progressStyle]} />
              </View>
            </View>

            {/* Header */}
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent']}
              style={styles.header}
              pointerEvents="box-none"
            >
              <View style={styles.headerContent}>
                <View style={styles.userInfo}>
                  {userPhoto ? (
                    <Image source={{ uri: userPhoto }} style={styles.userAvatar} />
                  ) : (
                    <View style={[styles.userAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                      <Text style={styles.userAvatarText}>
                        {userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.timestamp}>
                      {timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Photo */}
            {photo && (
              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: photo }}
                  style={styles.photo}
                  contentFit="cover"
                  transition={200}
                />
              </View>
            )}

            {/* Note */}
            {note && (
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.noteContainer}
                pointerEvents="none"
              >
                <View style={styles.noteContent}>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              </LinearGradient>
            )}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  progressContainer: {
    position: 'absolute',
    top: 70, // Below status bar
    left: 10,
    right: 10,
    zIndex: 30,
  },
  progressBarBg: {
    height: 2, // Slimmer
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingTop: 85,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  userAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  userDetails: {
    gap: 2,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: Theme.typography.fontWeight.bold,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: Theme.typography.fontWeight.medium,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  noteContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 60,
  },
  noteContent: {
    gap: 6,
  },
  noteText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: Theme.typography.fontWeight.medium,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
