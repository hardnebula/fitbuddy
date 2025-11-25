import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ScreenTransition } from '../../components/ScreenTransition';
import { AnimatedTitle } from '../../components/AnimatedTitle';
import { Theme } from '../../constants/Theme';

export default function ProfileScreen() {
  const [userName] = useState('Luna');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [currentStreak] = useState(15);
  const [bestStreak] = useState(45);
  const [totalCheckIns] = useState(127);

  // Mock calendar data - días del mes actual
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Días con check-in (simulado)
    const checkInDays = [1, 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23];
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        hasCheckIn: checkInDays.includes(i),
        isToday: i === today.getDate(),
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Badges del usuario
  const badges = [
    { id: 1, emoji: '🔥', name: 'Fire Starter', description: '7 day streak' },
    { id: 2, emoji: '⚡', name: 'Lightning', description: '30 day streak' },
    { id: 3, emoji: '💪', name: 'Strong', description: '100 check-ins' },
    { id: 4, emoji: '🏆', name: 'Champion', description: 'Best streak 45 days' },
    { id: 5, emoji: '⭐', name: 'Star', description: 'Perfect week' },
    { id: 6, emoji: '🎯', name: 'Focused', description: 'Never missed a Monday' },
  ];

  const handleChangePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setUserPhoto(result.assets[0].uri);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[new Date().getMonth()];

  return (
    <ScreenTransition>
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <AnimatedTitle style={styles.title}>Profile</AnimatedTitle>

        {/* Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={handleChangePhoto}>
          <View style={styles.avatar}>
            {userPhoto ? (
              <Image source={{ uri: userPhoto }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>👤</Text>
            )}
          </View>
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>

        <Text style={styles.userName}>{userName}</Text>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
            <Text style={styles.statEmoji}>🔥</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
            <Text style={styles.statEmoji}>⚡</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCheckIns}</Text>
            <Text style={styles.statLabel}>Total Check-ins</Text>
            <Text style={styles.statEmoji}>✅</Text>
          </View>
        </View>

        {/* Calendar Section */}
        <AnimatedTitle style={styles.sectionTitle}>{currentMonth} Activity</AnimatedTitle>
        <View style={styles.calendarCard}>
          <View style={styles.calendarGrid}>
            {calendarDays.map((day) => (
              <View
                key={day.day}
                style={[
                  styles.calendarDay,
                  day.hasCheckIn && styles.calendarDayActive,
                  day.isToday && styles.calendarDayToday,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    day.hasCheckIn && styles.calendarDayTextActive,
                    day.isToday && styles.calendarDayTextToday,
                  ]}
                >
                  {day.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badges Section */}
        <AnimatedTitle style={styles.sectionTitle}>Achievements</AnimatedTitle>
        <View style={styles.badgesContainer}>
          {badges.map((badge) => (
            <View key={badge.id} style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeDescription}>{badge.description}</Text>
            </View>
          ))}
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
    marginBottom: Theme.spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarEmoji: {
    fontSize: 50,
  },
  changePhotoText: {
    fontSize: Theme.typography.fontSize.sm,
    color: '#8B5CF6',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  userName: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.xs,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
  statEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
    marginBottom: Theme.spacing.md,
  },
  calendarCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  calendarDay: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayActive: {
    backgroundColor: '#8B5CF6',
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  calendarDayText: {
    fontSize: Theme.typography.fontSize.sm,
    color: '#999999',
    fontWeight: Theme.typography.fontWeight.medium,
  },
  calendarDayTextActive: {
    color: '#FFFFFF',
    fontWeight: Theme.typography.fontWeight.bold,
  },
  calendarDayTextToday: {
    color: '#8B5CF6',
    fontWeight: Theme.typography.fontWeight.bold,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 40,
    marginBottom: Theme.spacing.sm,
  },
  badgeName: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: Theme.typography.fontSize.xs,
    color: '#666666',
    textAlign: 'center',
  },
});
