import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenTransition } from '../../components/ScreenTransition';
import { AnimatedTitle } from '../../components/AnimatedTitle';
import { BadgeCard } from '../../components/BadgeCard';
import { Theme } from '../../constants/Theme';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProfileScreen() {
  const { colors, isDark, setTheme } = useTheme();
  const [userName] = useState('Luna');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [currentStreak] = useState(15);
  const [bestStreak] = useState(45);
  const [totalCheckIns] = useState(127);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

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
    { 
      id: '1', 
      name: '7 Day Streak', 
      description: 'Completed 7 consecutive days of check-ins. Keep the fire burning!',
      image: require('../../assets/images/Badges/7 day streak.png'),
      earnedDate: new Date(2024, 10, 15),
      rarity: 'rare' as const,
    },
    { 
      id: '2', 
      name: '30 Day Streak', 
      description: 'Achieved 30 consecutive days of check-ins. You\'re unstoppable!',
      image: require('../../assets/images/Badges/30 day streak.png'),
      earnedDate: new Date(2024, 10, 20),
      rarity: 'epic' as const,
    },
    { 
      id: '3', 
      name: '100 Check-ins', 
      description: 'Reached 100 total check-ins. A true dedication!',
      image: require('../../assets/images/Badges/100 Check in.png'),
      earnedDate: new Date(2024, 9, 10),
      rarity: 'epic' as const,
    },
    { 
      id: '4', 
      name: 'Legendary Badge', 
      description: 'Achieved legendary status. You\'re a true champion!',
      image: require('../../assets/images/Badges/Legendary badge.png'),
      earnedDate: new Date(2024, 8, 5),
      rarity: 'legendary' as const,
    },
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView 
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEnabled={true}
      >
        {/* Header with Theme Toggle */}
        <View style={styles.headerContainer}>
          <AnimatedTitle style={StyleSheet.flatten([styles.title, { color: colors.text }])}>Profile</AnimatedTitle>
          <TouchableOpacity 
            onPress={() => setTheme(isDark ? 'light' : 'dark')}
            style={[styles.themeToggle, { backgroundColor: colors.cardSecondary }]}
            activeOpacity={0.7}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              {isDark ? (
                // Sun icon for light mode
                <Path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  stroke={colors.text}
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              ) : (
                // Moon icon for dark mode
                <Path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  stroke={colors.text}
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                />
              )}
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={handleChangePhoto}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            {userPhoto ? (
              <Image source={{ uri: userPhoto }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>👤</Text>
            )}
          </View>
          <Text style={[styles.changePhotoText, { color: colors.primary }]}>Change Photo</Text>
        </TouchableOpacity>

        <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.cardSecondary }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{currentStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Current Streak</Text>
            <Text style={styles.statEmoji}>🔥</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardSecondary }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{bestStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Best Streak</Text>
            <Text style={styles.statEmoji}>⚡</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardSecondary }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{totalCheckIns}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Check-ins</Text>
            <Text style={styles.statEmoji}>✅</Text>
          </View>
        </View>

        {/* Calendar Section */}
        <AnimatedTitle style={StyleSheet.flatten([styles.sectionTitle, { color: colors.text }])}>{currentMonth} Activity</AnimatedTitle>
        <View style={[styles.calendarCard, { backgroundColor: colors.cardSecondary }]}>
          <View style={styles.calendarGrid}>
            {calendarDays.map((day) => (
              <View
                key={day.day}
                style={[
                  styles.calendarDay,
                  { backgroundColor: colors.surface },
                  day.hasCheckIn && { backgroundColor: colors.primary },
                  day.isToday && { borderWidth: 2, borderColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    { color: colors.textTertiary },
                    day.hasCheckIn && { color: '#FFFFFF', fontWeight: Theme.typography.fontWeight.bold },
                    day.isToday && { color: colors.primary, fontWeight: Theme.typography.fontWeight.bold },
                  ]}
                >
                  {day.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badges Section */}
        <AnimatedTitle style={StyleSheet.flatten([styles.sectionTitle, { color: colors.text }])}>Achievements</AnimatedTitle>
        <View style={styles.badgesContainer}>
          {badges.map((badge) => {
            const rarityColors = {
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
              <TouchableOpacity 
                key={badge.id} 
                style={styles.badgeCardWrapper}
                onPress={() => setSelectedBadge(badge)}
                activeOpacity={0.8}
              >
                <View 
                  style={[
                    styles.badgeCard, 
                    { 
                      shadowColor: rarityGlow[badge.rarity],
                      backgroundColor: colors.cardSecondary,
                    }
                  ]}
                >
                  {/* Rarity gradient background */}
                  <LinearGradient
                    colors={rarityColors[badge.rarity]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.badgeGradient}
                  />
                  
                  {/* Badge Image with white border */}
                  <View style={styles.badgeImageContainer}>
                    <View style={styles.badgeImageWhiteBackground} />
                    <Image 
                      source={badge.image} 
                      style={styles.badgeImage}
                      resizeMode="contain"
                    />
                  </View>
                  
                  {/* Badge Info */}
                  <View style={styles.badgeInfo}>
                    <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={2}>
                      {badge.name}
                    </Text>
                    <View style={[styles.rarityBadge, { 
                      backgroundColor: badge.rarity === 'legendary' ? '#F59E0B' : 
                                       badge.rarity === 'epic' ? '#A855F7' : 
                                       badge.rarity === 'rare' ? '#3B82F6' : '#94A3B8'
                    }]}>
                      <Text style={styles.rarityText}>{badge.rarity.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Badge Card Modal */}
        {selectedBadge && (
          <BadgeCard
            visible={!!selectedBadge}
            onClose={() => setSelectedBadge(null)}
            badge={selectedBadge}
          />
        )}
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
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
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
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
  },
  badgeCardWrapper: {
    width: '48%',
    marginBottom: Theme.spacing.md,
  },
  badgeCard: {
    width: '100%',
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  badgeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  badgeImageContainer: {
    width: '100%',
    aspectRatio: 0.72,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  badgeImageWhiteBackground: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: '#FFFFFF',
    zIndex: 0,
  },
  badgeImage: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.borderRadius.md,
    zIndex: 1,
  },
  badgeInfo: {
    padding: Theme.spacing.sm,
    paddingTop: Theme.spacing.xs,
    alignItems: 'center',
    backgroundColor: 'transparent',
    minHeight: 70,
    justifyContent: 'space-between',
  },
  badgeName: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  rarityBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
    marginTop: 'auto',
  },
  rarityText: {
    fontSize: 8,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  badgeEmoji: {
    fontSize: 40,
    marginBottom: Theme.spacing.sm,
  },
  badgeDescription: {
    fontSize: Theme.typography.fontSize.xs,
    color: '#666666',
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
