import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { Theme } from '../../constants/Theme';
import { DayCheckIn } from '../../types';

export default function ProfileScreen() {
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [userName, setUserName] = useState('John Doe');
  const [userEmail] = useState('john@example.com');
  const [totalCheckIns] = useState(127);
  const [bestStreak] = useState(45);
  const [currentStreak] = useState(15);

  // Generate mock calendar data for current month
  const generateCalendarData = (): DayCheckIn[] => {
    const days: DayCheckIn[] = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const checkedIn = Math.random() > 0.3; // 70% chance of checked in
      days.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        checkedIn,
      });
    }
    return days;
  };

  const [calendarData] = useState<DayCheckIn[]>(generateCalendarData());

  const handleSaveName = () => {
    setIsEditingName(false);
    Alert.alert('Saved', 'Name updated successfully');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => router.replace('/(auth)/welcome'),
        },
      ]
    );
  };

  const handleDayPress = (day: DayCheckIn) => {
    if (day.checkedIn) {
      Alert.alert('Check-in', `You checked in on ${day.date}`);
    }
  };

  // Calendar grid helper
  const renderCalendarGrid = () => {
    const weeks: DayCheckIn[][] = [];
    let currentWeek: DayCheckIn[] = [];

    calendarData.forEach((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();

      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push(day);

      // End of month
      if (index === calendarData.length - 1) {
        weeks.push(currentWeek);
      }
    });

    return weeks.map((week, weekIndex) => (
      <View key={weekIndex} style={styles.calendarWeek}>
        {week.map((day, dayIndex) => {
          const date = new Date(day.date);
          const dayNumber = date.getDate();
          return (
            <TouchableOpacity
              key={dayIndex}
              style={[
                styles.calendarDay,
                day.checkedIn && styles.calendarDayChecked,
              ]}
              onPress={() => handleDayPress(day)}
            >
              <Text
                style={[
                  styles.calendarDayText,
                  day.checkedIn && styles.calendarDayTextChecked,
                ]}
              >
                {dayNumber}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <Avatar name={userName} size={80} showBorder borderColor={Theme.colors.primary} />
          <View style={styles.nameContainer}>
            {isEditingName ? (
              <View style={styles.editNameContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={userName}
                  onChangeText={setUserName}
                  autoFocus
                  onSubmitEditing={handleSaveName}
                />
                <TouchableOpacity onPress={handleSaveName}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setIsEditingName(true)}>
                <Text style={styles.userName}>{userName}</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalCheckIns}</Text>
              <Text style={styles.statLabel}>Total Check-ins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statItem}>
              <StreakBadge days={currentStreak} size="large" />
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
          </View>
        </Card>

        {/* Calendar Section */}
        <Card style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>This Month</Text>
          <View style={styles.calendarContainer}>
            {renderCalendarGrid()}
          </View>
          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotChecked]} />
              <Text style={styles.legendText}>Checked in</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Not checked in</Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/settings')}
          style={styles.settingsLink}
        >
          <Text style={styles.settingsLinkText}>Settings</Text>
        </TouchableOpacity>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          fullWidth
          style={styles.signOutButton}
        />

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  userName: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  nameInput: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.primary,
    paddingBottom: Theme.spacing.xs,
    minWidth: 150,
  },
  saveButton: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  userEmail: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.textSecondary,
  },
  statsCard: {
    marginBottom: Theme.spacing.lg,
  },
  statsTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  calendarCard: {
    marginBottom: Theme.spacing.lg,
  },
  calendarTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  calendarContainer: {
    marginBottom: Theme.spacing.md,
  },
  calendarWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xs,
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  calendarDayChecked: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  calendarDayText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  calendarDayTextChecked: {
    color: Theme.colors.text,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Theme.spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  legendDotChecked: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  legendText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  settingsLink: {
    marginBottom: Theme.spacing.lg,
  },
  settingsLinkText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  signOutButton: {
    marginBottom: Theme.spacing.lg,
  },
  version: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textTertiary,
    textAlign: 'center',
  },
});

