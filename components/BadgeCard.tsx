import React, { useRef } from 'react';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const { colors, isDark } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Rotate based on horizontal movement
        const rotation = gestureState.dx / SCREEN_WIDTH;
        rotateAnim.setValue(rotation);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Snap back to original position or flip
        const shouldFlip = Math.abs(gestureState.dx) > SCREEN_WIDTH * 0.3;
        
        Animated.spring(rotateAnim, {
          toValue: shouldFlip ? (gestureState.dx > 0 ? 1 : -1) : 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start(() => {
          if (shouldFlip) {
            // Reset after flip
            setTimeout(() => {
              rotateAnim.setValue(0);
            }, 100);
          }
        });
      },
    })
  ).current;

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-180deg', '0deg', '180deg'],
  });

  const rarityColors: Record<string, [string, string]> = {
    common: ['#94A3B8', '#64748B'],
    rare: ['#3B82F6', '#2563EB'],
    epic: ['#A855F7', '#7C3AED'],
    legendary: ['#F59E0B', '#D97706'],
  };

  const rarityGlow = {
    common: 'rgba(148, 163, 184, 0.3)',
    rare: 'rgba(59, 130, 246, 0.4)',
    epic: 'rgba(168, 85, 247, 0.5)',
    legendary: 'rgba(245, 158, 11, 0.6)',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity 
          style={styles.closeArea} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <View style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </View>
        </TouchableOpacity>

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.cardContainer,
            {
              transform: [
                { rotateY: rotateInterpolate },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={rarityColors[badge.rarity]}
            style={[
              styles.card,
              { 
                shadowColor: rarityGlow[badge.rarity],
                backgroundColor: colors.surface,
              },
            ]}
          >
            {/* Front of card */}
            <View style={styles.cardFront}>
              <View style={styles.cardHeader}>
                <Text style={styles.rarityBadge}>{badge.rarity.toUpperCase()}</Text>
              </View>

              <View style={styles.imageContainer}>
                <Image
                  source={badge.image}
                  style={styles.badgeImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
                
                {badge.earnedDate && (
                  <View style={styles.earnedContainer}>
                    <Text style={styles.earnedLabel}>Earned on</Text>
                    <Text style={styles.earnedDate}>
                      {badge.earnedDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.swipeHint}>← Swipe to rotate →</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  cardContainer: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 1.3,
    zIndex: 5,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: Theme.spacing.xl,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  cardFront: {
    flex: 1,
  },
  cardHeader: {
    alignItems: 'flex-end',
    marginBottom: Theme.spacing.md,
  },
  rarityBadge: {
    color: '#FFFFFF',
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
    letterSpacing: 1.5,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: Theme.borderRadius.md,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Theme.spacing.xl,
  },
  badgeImage: {
    width: '80%',
    height: '80%',
  },
  cardContent: {
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  badgeName: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: Theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Theme.spacing.lg,
  },
  earnedContainer: {
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
  },
  earnedLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: Theme.spacing.xs,
  },
  earnedDate: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  cardFooter: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: Theme.spacing.md,
  },
  swipeHint: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
});
