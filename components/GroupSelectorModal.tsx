import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/Button';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Id } from '@/convex/_generated/dataModel';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.75;

interface GroupSelectorModalProps {
  visible: boolean;
  groups: Array<{
    _id: Id<'groups'>;
    name: string;
    groupStreak: number;
  }>;
  selectedGroupId: Id<'groups'> | null;
  onClose: () => void;
  onSelectGroup: (groupId: Id<'groups'>) => void;
  onCreateGroup?: () => void;
}

export function GroupSelectorModal({
  visible,
  groups,
  selectedGroupId,
  onClose,
  onSelectGroup,
  onCreateGroup,
}: GroupSelectorModalProps) {
  const { colors, isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(DRAWER_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: DRAWER_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: DRAWER_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: opacityAnim,
              backgroundColor: isDark
                ? 'rgba(0, 0, 0, 0.7)'
                : 'rgba(0, 0, 0, 0.5)',
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.overlayTouchable} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: colors.surface,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SafeAreaView edges={['bottom']} style={styles.drawerContent}>
            {/* Handle bar */}
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: colors.border },
                ]}
              />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Group
              </Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Choose which group to display
              </Text>
            </View>

            {/* Groups List */}
            <ScrollView
              style={styles.groupsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.groupsListContent}
            >
              {groups.map((group) => (
                <TouchableOpacity
                  key={group._id}
                  style={[
                    styles.groupItem,
                    {
                      backgroundColor:
                        selectedGroupId === group._id
                          ? colors.primary + '15'
                          : colors.cardSecondary,
                      borderColor:
                        selectedGroupId === group._id
                          ? colors.primary
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelectGroup(group._id);
                    handleClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemContent}>
                    <View style={styles.groupItemLeft}>
                      <Text
                        style={[
                          styles.groupItemName,
                          {
                            color: colors.text,
                            fontWeight:
                              selectedGroupId === group._id
                                ? Theme.typography.fontWeight.semibold
                                : Theme.typography.fontWeight.normal,
                          },
                        ]}
                      >
                        {group.name}
                      </Text>
                      <Text
                        style={[
                          styles.groupItemInfo,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {group.groupStreak} day streak
                      </Text>
                    </View>
                    {selectedGroupId === group._id && (
                      <View
                        style={[
                          styles.checkmarkContainer,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Actions */}
            {onCreateGroup && (
              <View
                style={[
                  styles.actions,
                  { borderTopColor: colors.border },
                ]}
              >
                <Button
                  title="Create New Group"
                  onPress={() => {
                    handleClose();
                    onCreateGroup();
                  }}
                  fullWidth
                />
              </View>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTouchable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: DRAWER_HEIGHT,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerContent: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
  },
  groupsList: {
    flex: 1,
  },
  groupsListContent: {
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
  },
  groupItem: {
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 2,
    overflow: 'hidden',
  },
  groupItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  groupItemLeft: {
    flex: 1,
  },
  groupItemName: {
    fontSize: Theme.typography.fontSize.lg,
    marginBottom: Theme.spacing.xs,
  },
  groupItemInfo: {
    fontSize: Theme.typography.fontSize.sm,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.md,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  actions: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
    borderTopWidth: 1,
  },
});

