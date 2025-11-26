import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ScreenTransition } from '../../components/ScreenTransition';
import { AnimatedTitle } from '../../components/AnimatedTitle';
import { Theme } from '../../constants/Theme';
import { useTheme } from '../../contexts/ThemeContext';
import { Group } from '../../types';

export default function GroupsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Mock groups data
  const groups: Group[] = [
    {
      id: '1',
      name: 'Morning Runners',
      members: [
        { id: '1', name: 'You', email: 'you@example.com', totalCheckIns: 127, bestStreak: 45, currentStreak: 15 },
        { id: '2', name: 'Sarah', email: 'sarah@example.com', totalCheckIns: 98, bestStreak: 30, currentStreak: 8 },
        { id: '3', name: 'Mike', email: 'mike@example.com', totalCheckIns: 112, bestStreak: 25, currentStreak: 8 },
        { id: '4', name: 'Emma', email: 'emma@example.com', totalCheckIns: 89, bestStreak: 20, currentStreak: 5 },
      ],
      groupStreak: 8,
      inviteCode: 'FITBUDDY-ABC123',
    },
  ];

  const handleCreateGroup = () => {
    router.push('/(auth)/create-group');
  };

  if (groups.length === 0) {
    return (
      <ScreenTransition>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <AnimatedTitle style={StyleSheet.flatten([styles.title, { color: colors.text }])}>Your Groups</AnimatedTitle>
          <Image 
            source={isDark ? require('../../assets/images/Sirius and Teo dark mode.png') : require('../../assets/images/Sirius and Teo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <EmptyState
          message="No groups yet"
          submessage="Create your first group to get started!"
        />
        <View style={styles.footer}>
          <Button
            title="+ Create New Group"
            onPress={handleCreateGroup}
            fullWidth
            size="large"
          />
        </View>
      </SafeAreaView>
      </ScreenTransition>
    );
  }

  return (
    <ScreenTransition>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AnimatedTitle style={StyleSheet.flatten([styles.title, { color: colors.text }])}>Your Groups</AnimatedTitle>
          <Image 
            source={isDark ? require('../../assets/images/Sirius and Teo dark mode.png') : require('../../assets/images/Sirius and Teo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {groups.map((group) => (
          <TouchableOpacity
            key={group.id}
            onPress={() => router.push('/(tabs)/home')}
            activeOpacity={0.8}
          >
            <Card style={StyleSheet.flatten([styles.groupCard, { backgroundColor: colors.cardSecondary }])}>
              <View style={styles.groupHeader}>
                <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
                <Text style={[styles.membersCount, { color: colors.textTertiary }]}>
                  {group.members.length} members
                </Text>
              </View>
              <View style={styles.groupStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Group Streak</Text>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {group.groupStreak} days 🔥
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <Button
          title="+ Create New Group"
          onPress={handleCreateGroup}
          fullWidth
          size="large"
          style={styles.createButton}
        />
      </ScrollView>
    </SafeAreaView>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    paddingTop: Theme.spacing.sm,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
  },
  groupCard: {
    marginBottom: Theme.spacing.md,
    backgroundColor: '#F5F5F5',
  },
  groupHeader: {
    marginBottom: Theme.spacing.md,
  },
  groupName: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
    marginBottom: Theme.spacing.xs,
  },
  membersCount: {
    fontSize: Theme.typography.fontSize.sm,
    color: '#999999',
  },
  groupStats: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: '#666666',
    marginBottom: Theme.spacing.xs,
  },
  statValue: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: '#8B5CF6',
  },
  createButton: {
    marginTop: Theme.spacing.lg,
  },
  footer: {
    padding: Theme.spacing.lg,
  },
});

