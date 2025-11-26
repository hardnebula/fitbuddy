import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../constants/Theme';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
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
  const { colors } = useTheme();
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shineX = useRef(new Animated.Value(0.5)).current;
  const shineY = useRef(new Animated.Value(0.5)).current;
  const [isPressed, setIsPressed] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        // Calculate tilt based on touch position relative to card center
        const touchX = gestureState.moveX - (SCREEN_WIDTH / 2);
        const touchY = gestureState.moveY - (SCREEN_HEIGHT / 2);
        
        // Normalize to -1 to 1 range and apply max rotation of 25 degrees
        const tiltX = (touchY / (CARD_HEIGHT / 2)) * -25;
        const tiltY = (touchX / (CARD_WIDTH / 2)) * 25;
        
        rotateX.setValue(Math.max(-25, Math.min(25, tiltX)));
        rotateY.setValue(Math.max(-25, Math.min(25, tiltY)));
        
        // Update shine position (0 to 1)
        const normalizedX = (touchX / (CARD_WIDTH / 2) + 1) / 2;
        const normalizedY = (touchY / (CARD_HEIGHT / 2) + 1) / 2;
        shineX.setValue(Math.max(0, Math.min(1, normalizedX)));
        shineY.setValue(Math.max(0, Math.min(1, normalizedY)));
      },
      onPanResponderRelease: () => {
        setIsPressed(false);
        // Animate back to neutral position
        Animated.parallel([
          Animated.spring(rotateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(rotateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(shineX, {
            toValue: 0.5,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(shineY, {
            toValue: 0.5,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
        ]).start();
      },
    })
  ).current;

  const rotateXDeg = rotateX.interpolate({
    inputRange: [-25, 25],
    outputRange: ['-25deg', '25deg'],
  });

  const rotateYDeg = rotateY.interpolate({
    inputRange: [-25, 25],
    outputRange: ['-25deg', '25deg'],
  });

  const rarityGlow = {
    common: 'rgba(148, 163, 184, 0.6)',
    rare: 'rgba(59, 130, 246, 0.7)',
    epic: 'rgba(168, 85, 247, 0.8)',
    legendary: 'rgba(245, 158, 11, 0.9)',
  };

  const rarityShineColors = {
    common: ['transparent', 'rgba(255,255,255,0.2)', 'transparent'],
    rare: ['transparent', 'rgba(100,200,255,0.4)', 'rgba(255,255,255,0.3)', 'transparent'],
    epic: ['transparent', 'rgba(200,100,255,0.4)', 'rgba(255,200,255,0.3)', 'transparent'],
    legendary: ['transparent', 'rgba(255,215,0,0.5)', 'rgba(255,255,255,0.4)', 'rgba(255,180,0,0.3)', 'transparent'],
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
        <TouchableOpacity 
          style={styles.closeArea} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <View style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.cardWrapper}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.cardContainer,
              {
                transform: [
                  { perspective: 1000 },
                  { rotateX: rotateXDeg },
                  { rotateY: rotateYDeg },
                  { scale: scaleAnim },
                ],
                shadowColor: rarityGlow[badge.rarity],
                shadowOffset: { width: 0, height: isPressed ? 30 : 15 },
                shadowOpacity: isPressed ? 1 : 0.8,
                shadowRadius: isPressed ? 40 : 25,
              },
            ]}
          >
            {/* Card Image - The actual badge card */}
            <Image
              source={badge.image}
              style={styles.cardImage}
              resizeMode="cover"
            />
            
            {/* Holographic shine overlay */}
            <Animated.View
              style={[
                styles.shineOverlay,
                {
                  opacity: isPressed ? 0.8 : 0.3,
                },
              ]}
            >
              <LinearGradient
                colors={rarityShineColors[badge.rarity] as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shineGradient}
              />
            </Animated.View>

            {/* Moving light reflection */}
            <Animated.View
              style={[
                styles.lightReflection,
                {
                  opacity: isPressed ? 0.6 : 0,
                  left: shineX.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-50%', '100%'],
                  }),
                  top: shineY.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-50%', '100%'],
                  }),
                },
              ]}
            />

            {/* Rarity indicator */}
            <View style={[styles.rarityBadge, { backgroundColor: rarityGlow[badge.rarity] }]}>
              <Text style={styles.rarityText}>{badge.rarity.toUpperCase()}</Text>
            </View>
          </Animated.View>

          {/* Card info below */}
          <View style={styles.cardInfo}>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
            {badge.earnedDate && (
              <Text style={styles.earnedDate}>
                🏆 Earned {badge.earnedDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            )}
          </View>

          <Text style={styles.hintText}>✨ Touch and drag to interact</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '300',
  },
  cardWrapper: {
    alignItems: 'center',
    zIndex: 5,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  shineGradient: {
    flex: 1,
    borderRadius: 20,
  },
  lightReflection: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ scale: 2 }],
  },
  rarityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardInfo: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  badgeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  badgeDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  earnedDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
