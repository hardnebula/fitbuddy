import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface BadgeCardProps {
  visible: boolean;
  onClose: () => void;
  badge: {
    id: string;
    name: string;
    description: string;
    image: any;
    earnedDate?: Date;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ visible, onClose, badge }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Animation values
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const flipProgress = useSharedValue(0);
  const shinePosition = useSharedValue(0.5);
  const shadowOffsetY = useSharedValue(15);
  const shadowOpacity = useSharedValue(0.5);
  const isActive = useSharedValue(false);

  // Reset on open
  useEffect(() => {
    if (visible) {
      setIsFlipped(false);
      flipProgress.value = 0;
      rotateX.value = 0;
      rotateY.value = 0;
      scale.value = 1;
      translateY.value = 0;
      shinePosition.value = 0.5;
      shadowOffsetY.value = 15;
      shadowOpacity.value = 0.5;
      
      // Entrance animation
      scale.value = withSequence(
        withTiming(0.9, { duration: 0 }),
        withSpring(1, { damping: 12, stiffness: 100 })
      );
    }
  }, [visible]);

  // Pan gesture for realistic 3D card interaction
  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      'worklet';
      isActive.value = true;
      // Lift card up
      scale.value = withSpring(1.08, { damping: 15, stiffness: 200 });
      translateY.value = withSpring(-20, { damping: 15, stiffness: 200 });
      shadowOffsetY.value = withSpring(35, { damping: 15 });
      shadowOpacity.value = withSpring(0.8, { damping: 15 });
    })
    .onUpdate((event) => {
      'worklet';
      // Calculate tilt based on finger position relative to card center
      // More sensitive rotation for realistic feel
      const centerX = CARD_WIDTH / 2;
      const centerY = CARD_HEIGHT / 2;
      
      const tiltY = ((event.x - centerX) / centerX) * 25; // Left-right tilt
      const tiltX = -((event.y - centerY) / centerY) * 20; // Up-down tilt
      
      rotateX.value = tiltX;
      rotateY.value = tiltY;
      
      // Update shine position based on finger location
      shinePosition.value = event.x / CARD_WIDTH;
      
      // Dynamic shadow based on tilt
      const shadowX = -tiltY * 0.5;
      const shadowY = 25 + tiltX * 0.3;
    })
    .onEnd(() => {
      'worklet';
      isActive.value = false;
      // Smooth return to rest position
      rotateX.value = withSpring(0, { damping: 12, stiffness: 120 });
      rotateY.value = withSpring(0, { damping: 12, stiffness: 120 });
      scale.value = withSpring(1, { damping: 12, stiffness: 120 });
      translateY.value = withSpring(0, { damping: 12, stiffness: 120 });
      shinePosition.value = withTiming(0.5, { duration: 400, easing: Easing.out(Easing.quad) });
      shadowOffsetY.value = withSpring(15, { damping: 15 });
      shadowOpacity.value = withSpring(0.5, { damping: 15 });
    })
    .onFinalize(() => {
      'worklet';
      if (isActive.value) {
        isActive.value = false;
        rotateX.value = withSpring(0, { damping: 12, stiffness: 120 });
        rotateY.value = withSpring(0, { damping: 12, stiffness: 120 });
        scale.value = withSpring(1, { damping: 12, stiffness: 120 });
        translateY.value = withSpring(0, { damping: 12, stiffness: 120 });
        shadowOffsetY.value = withSpring(15, { damping: 15 });
        shadowOpacity.value = withSpring(0.5, { damping: 15 });
      }
    });

  // Flip handler with smooth animation
  const handleFlip = () => {
    const newFlipped = !isFlipped;
    
    // Add a slight bounce effect during flip
    scale.value = withSequence(
      withTiming(0.95, { duration: 150 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );
    
    flipProgress.value = withTiming(newFlipped ? 1 : 0, {
      duration: 700,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    }, () => {
      runOnJS(setIsFlipped)(newFlipped);
    });
  };

  // Front card animated style with realistic 3D transforms
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateYFlip = interpolate(flipProgress.value, [0, 1], [0, 180]);
    
    return {
      transform: [
        { perspective: 1500 },
        { translateY: translateY.value },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value + rotateYFlip}deg` },
        { scale: scale.value },
      ],
      shadowOffset: { 
        width: -rotateY.value * 0.3, 
        height: shadowOffsetY.value 
      },
      shadowOpacity: shadowOpacity.value,
      shadowRadius: interpolate(scale.value, [1, 1.08], [20, 35]),
    };
  });

  // Back card animated style
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateYFlip = interpolate(flipProgress.value, [0, 1], [180, 360]);
    
    return {
      transform: [
        { perspective: 1500 },
        { translateY: translateY.value },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateYFlip}deg` },
        { scale: scale.value },
      ],
      shadowOffset: { 
        width: -rotateY.value * 0.3, 
        height: shadowOffsetY.value 
      },
      shadowOpacity: shadowOpacity.value,
      shadowRadius: interpolate(scale.value, [1, 1.08], [20, 35]),
    };
  });

  // Holographic shine effect
  const shineAnimatedStyle = useAnimatedStyle(() => {
    const baseOpacity = interpolate(scale.value, [1, 1.08], [0.15, 0.6]);
    const rotationEffect = Math.abs(rotateY.value) / 25;
    
    return {
      transform: [
        { translateX: interpolate(shinePosition.value, [0, 1], [-CARD_WIDTH * 0.8, CARD_WIDTH * 0.8]) },
        { rotate: '20deg' },
        { scaleY: 2.5 },
      ],
      opacity: baseOpacity + rotationEffect * 0.3,
    };
  });

  // Rainbow reflection effect
  const rainbowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        Math.abs(rotateY.value) + Math.abs(rotateX.value),
        [0, 20, 40],
        [0, 0.2, 0.4]
      ),
    };
  });

  // Rarity configurations
  const rarityConfig = {
    common: {
      glow: '#9CA3AF',
      colors: ['#9CA3AF', '#6B7280'] as const,
      label: 'COMMON',
    },
    rare: {
      glow: '#3B82F6',
      colors: ['#60A5FA', '#3B82F6'] as const,
      label: 'RARE',
    },
    epic: {
      glow: '#A855F7',
      colors: ['#C084FC', '#A855F7'] as const,
      label: 'EPIC',
    },
    legendary: {
      glow: '#F59E0B',
      colors: ['#FCD34D', '#F59E0B'] as const,
      label: 'LEGENDARY',
    },
  };

  const config = rarityConfig[badge.rarity];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.container}>
          <GestureDetector gesture={panGesture}>
            <View style={styles.cardContainer}>
              {/* Front Card */}
              <Animated.View
                style={[
                  styles.card,
                  frontAnimatedStyle,
                  { shadowColor: config.glow },
                ]}
              >
                <Image
                  source={badge.image}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                
                {/* Holographic shine */}
                <Animated.View style={[styles.shine, shineAnimatedStyle]}>
                  <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.7)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
                
                {/* Rainbow effect */}
                <Animated.View style={[styles.rainbow, rainbowAnimatedStyle]}>
                  <LinearGradient
                    colors={['rgba(255,0,0,0.15)', 'rgba(255,165,0,0.15)', 'rgba(255,255,0,0.15)', 'rgba(0,255,0,0.15)', 'rgba(0,0,255,0.15)', 'rgba(128,0,128,0.15)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </Animated.View>

              {/* Back Card */}
              <Animated.View
                style={[
                  styles.card,
                  styles.cardBack,
                  backAnimatedStyle,
                  { shadowColor: config.glow },
                ]}
              >
                <LinearGradient
                  colors={['#1a1a2e', '#16213e', '#0f0f1a']}
                  style={styles.backGradient}
                >
                  <View style={[styles.backBorder, { borderColor: config.colors[0] }]}>
                    {/* Decorative corners */}
                    <View style={[styles.corner, styles.cornerTL, { borderColor: config.colors[0] }]} />
                    <View style={[styles.corner, styles.cornerTR, { borderColor: config.colors[0] }]} />
                    <View style={[styles.corner, styles.cornerBL, { borderColor: config.colors[0] }]} />
                    <View style={[styles.corner, styles.cornerBR, { borderColor: config.colors[0] }]} />

                    {/* Rarity badge */}
                    <LinearGradient
                      colors={config.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.rarityPill}
                    >
                      <Text style={styles.rarityText}>{config.label}</Text>
                    </LinearGradient>

                    {/* Title */}
                    <Text style={styles.backTitle}>{badge.name}</Text>

                    {/* Decorative divider */}
                    <View style={styles.dividerContainer}>
                      <View style={[styles.dividerLine, { backgroundColor: config.colors[0] }]} />
                      <Text style={[styles.dividerIcon, { color: config.colors[0] }]}>✦</Text>
                      <View style={[styles.dividerLine, { backgroundColor: config.colors[0] }]} />
                    </View>

                    {/* Description */}
                    <Text style={styles.backDesc}>{badge.description}</Text>

                    {/* Earned date */}
                    {badge.earnedDate && (
                      <View style={styles.dateBox}>
                        <Text style={styles.dateLabel}>UNLOCKED</Text>
                        <Text style={[styles.dateValue, { color: config.colors[0] }]}>
                          {badge.earnedDate.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>
          </GestureDetector>

          {/* Flip button */}
          <TouchableOpacity onPress={handleFlip} activeOpacity={0.85} style={styles.flipBtnWrapper}>
            <LinearGradient
              colors={config.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.flipBtn}
            >
              <Text style={styles.flipBtnText}>
                {isFlipped ? '↻ View Card' : '↻ View Details'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Hint text */}
          <Text style={styles.hintText}>Touch and drag the card</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '300',
  },
  container: {
    alignItems: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    elevation: 20,
    position: 'absolute',
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  shine: {
    position: 'absolute',
    top: -CARD_HEIGHT * 0.5,
    left: 0,
    width: CARD_WIDTH * 0.5,
    height: CARD_HEIGHT * 2,
  },
  rainbow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  backGradient: {
    flex: 1,
    borderRadius: 12,
    padding: 4,
  },
  backBorder: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'rgba(15, 15, 26, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 2,
  },
  cornerTL: {
    top: 12,
    left: 12,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 12,
    right: 12,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 12,
    left: 12,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 12,
    right: 12,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  rarityPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  rarityText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  backTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '60%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerIcon: {
    marginHorizontal: 12,
    fontSize: 12,
  },
  backDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  dateBox: {
    alignItems: 'center',
    marginTop: 8,
  },
  dateLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  flipBtnWrapper: {
    marginTop: 28,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  flipBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  flipBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hintText: {
    marginTop: 16,
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    fontStyle: 'italic',
  },
});
