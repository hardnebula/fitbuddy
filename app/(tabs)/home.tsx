import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { AnimatedButton } from '../../components/AnimatedButton';
import { StreakBadge } from '../../components/StreakBadge';
import { Theme } from '../../constants/Theme';
import { CheckIn } from '../../types';

export default function HomeScreen() {
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInNote, setCheckInNote] = useState('');
  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null);
  const [userStreak] = useState(15);
  const [groupStreak] = useState(8);
  const [lastCheckIn] = useState('3h ago');

  // Mock check-ins data
  const [checkIns] = useState<CheckIn[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Sarah',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      note: 'Great run this morning!',
    },
    {
      id: '2',
      userId: '3',
      userName: 'Mike',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCheckInPhoto(result.assets[0].uri);
    }
  };

  const handleCheckIn = () => {
    if (!checkInNote.trim() && !checkInPhoto) {
      Alert.alert('Add something', 'Please add a note or photo');
      return;
    }
    setCheckedInToday(true);
    setShowCheckInModal(false);
    setCheckInNote('');
    setCheckInPhoto(null);
    Alert.alert('Success!', 'Check-in recorded! 🔥', [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.groupName}>Morning Runners</Text>
            <Text style={styles.groupSubtext}>4 members</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <Card style={styles.heroCard} glow={checkedInToday}>
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                checkedInToday && styles.statusCompleted,
              ]}
            >
              {checkedInToday ? '✓ Completed Today' : 'Not Yet'}
            </Text>
          </View>

          <AnimatedButton
            onPress={() => setShowCheckInModal(true)}
            disabled={checkedInToday}
            style={styles.checkInButton}
          >
            <LinearGradient
              colors={
                checkedInToday
                  ? [Theme.colors.accent, Theme.colors.accentDark]
                  : [Theme.colors.primary, Theme.colors.primaryDark]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.checkInButtonText}>
                {checkedInToday ? 'Already Checked In!' : 'I Exercised Today'}
              </Text>
            </LinearGradient>
          </AnimatedButton>

          <Text style={styles.lastCheckIn}>Last check-in: {lastCheckIn}</Text>
        </Card>

        {/* Streak Section */}
        <View style={styles.streakSection}>
          <View style={styles.streakItem}>
            <Text style={styles.streakLabel}>Your Streak</Text>
            <StreakBadge days={userStreak} size="medium" />
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakLabel}>Group Streak</Text>
            <StreakBadge days={groupStreak} size="small" />
          </View>
        </View>

        {/* Group Feed */}
        <View style={styles.feedSection}>
          <Text style={styles.feedTitle}>Group Feed</Text>
          {checkIns.map((checkIn) => (
            <Card key={checkIn.id} style={styles.feedCard}>
              <View style={styles.feedItem}>
                <Avatar
                  name={checkIn.userName}
                  size={48}
                  showBorder
                  borderColor={Theme.colors.accent}
                />
                <View style={styles.feedContent}>
                  <Text style={styles.feedName}>{checkIn.userName}</Text>
                  <Text style={styles.feedTime}>
                    {checkIn.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {checkIn.note && (
                    <Text style={styles.feedNote}>{checkIn.note}</Text>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Check-in Modal */}
      <Modal
        visible={showCheckInModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCheckInModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Your Activity</Text>

            {checkInPhoto ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: checkInPhoto }} style={styles.photo} />
                <TouchableOpacity
                  onPress={() => setCheckInPhoto(null)}
                  style={styles.removePhoto}
                >
                  <Text style={styles.removePhotoText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.photoButton}
              >
                <Text style={styles.photoButtonIcon}>📷</Text>
                <Text style={styles.photoButtonText}>Add Photo</Text>
              </TouchableOpacity>
            )}

            <TextInput
              style={styles.noteInput}
              placeholder="Add a note (optional)"
              placeholderTextColor={Theme.colors.textTertiary}
              value={checkInNote}
              onChangeText={setCheckInNote}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowCheckInModal(false);
                  setCheckInNote('');
                  setCheckInPhoto(null);
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Confirm"
                onPress={handleCheckIn}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.secondary,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  groupName: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  groupSubtext: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  settingsIcon: {
    fontSize: 24,
  },
  heroCard: {
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
  },
  statusContainer: {
    marginBottom: Theme.spacing.lg,
  },
  statusText: {
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  statusCompleted: {
    color: Theme.colors.accent,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  checkInButton: {
    width: '100%',
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.glow,
  },
  gradient: {
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInButtonText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  lastCheckIn: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  streakSection: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  streakDivider: {
    width: 1,
    backgroundColor: Theme.colors.border,
    marginHorizontal: Theme.spacing.md,
  },
  feedSection: {
    marginTop: Theme.spacing.md,
  },
  feedTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  feedCard: {
    marginBottom: Theme.spacing.md,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  feedContent: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  feedName: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  feedTime: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  feedNote: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.card,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xl,
  },
  photoButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderStyle: 'dashed',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
    minHeight: 120,
  },
  photoButtonIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.sm,
  },
  photoButtonText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  photoContainer: {
    marginBottom: Theme.spacing.lg,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.sm,
  },
  removePhoto: {
    alignSelf: 'flex-start',
  },
  removePhotoText: {
    color: Theme.colors.error,
    fontSize: Theme.typography.fontSize.sm,
  },
  noteInput: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: Theme.spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

