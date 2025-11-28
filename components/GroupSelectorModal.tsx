import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from "react-native-svg";
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Id } from '@/convex/_generated/dataModel';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GroupSelectorModalProps {
  visible: boolean;
  groups: Array<{
    _id: Id<'groups'>;
    name: string;
    groupStreak: number;
  }>;
  selectedGroupId: Id<'groups'> | null;
  onClose: () => void;
  onSelectGroup: (groupId: Id<'groups'> | null) => void;
  onCreateGroup?: () => void;
}

// Stable snap points to prevent re-renders
const MODAL_SNAP_POINTS = ['65%'];

export function GroupSelectorModal({
  visible,
  groups,
  selectedGroupId,
  onClose,
  onSelectGroup,
  onCreateGroup,
}: GroupSelectorModalProps) {
  const { colors } = useTheme();

  const handleSelectGroup = (groupId: Id<'groups'>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectGroup(groupId);
    onClose();
  };

  const handleCreateGroup = () => {
    onClose();
    onCreateGroup?.();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={MODAL_SNAP_POINTS}
      enablePanDownToClose={true}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Switch Group
          </Text>
        </View>

        {/* Groups List */}
        <ScrollView
          style={styles.groupsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.groupsListContent}
        >
          {/* Personal Option */}
          <TouchableOpacity
            style={[
              styles.groupItem,
              {
                backgroundColor: selectedGroupId === null ? colors.cardSecondary : 'transparent',
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectGroup(null);
              onClose();
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.groupIcon, { backgroundColor: colors.primary + '20' }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </Svg>
            </View>

            <View style={styles.groupItemContent}>
              <Text
                numberOfLines={1}
                style={[
                  styles.groupItemName,
                  {
                    color: colors.text,
                    fontWeight: selectedGroupId === null ? '700' : '500',
                  },
                ]}
              >
                Personal
              </Text>
              <Text style={[styles.personalSubtext, { color: colors.textSecondary }]}>
                Your individual progress
              </Text>
            </View>

            {selectedGroupId === null && (
              <View style={[styles.checkmarkContainer, { backgroundColor: colors.primary }]}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M20 6L9 17l-5-5" />
                </Svg>
              </View>
            )}
          </TouchableOpacity>

          {groups.map((group) => {
            const isSelected = selectedGroupId === group._id;
            return (
              <TouchableOpacity
                key={group._id}
                style={[
                  styles.groupItem,
                  {
                    backgroundColor: isSelected ? colors.cardSecondary : 'transparent',
                  },
                ]}
                onPress={() => handleSelectGroup(group._id)}
                activeOpacity={0.7}
              >
                {/* Group Icon Placeholder */}
                <View style={[styles.groupIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.groupInitial, { color: colors.primary }]}>
                    {group.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.groupItemContent}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.groupItemName,
                      {
                        color: colors.text,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {group.name}
                  </Text>
                  <View style={styles.streakContainer}>
                    <Text style={styles.streakEmoji}>🔥</Text>
                    <Text style={[styles.streakText, { color: colors.textSecondary }]}>
                      {group.groupStreak}
                    </Text>
                  </View>
                </View>

                {isSelected && (
                  <View style={[styles.checkmarkContainer, { backgroundColor: colors.primary }]}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M20 6L9 17l-5-5" />
                    </Svg>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer Actions */}
        {onCreateGroup && (
          <SafeAreaView edges={['bottom']} style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button
              title="Create New Group"
              onPress={handleCreateGroup}
              fullWidth
              size="large"
              variant="filled"
            />
          </SafeAreaView>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
  },
  personalSubtext: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: 2,
  },
  groupsList: {
    flex: 1,
  },
  groupsListContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.xl,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  groupInitial: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  groupItemContent: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  groupItemName: {
    fontSize: Theme.typography.fontSize.lg,
    marginBottom: 2,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  streakText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    borderTopWidth: 1,
  },
});
