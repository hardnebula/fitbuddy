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
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { AnimatedButton } from '../../components/AnimatedButton';
import { StreakBadge } from '../../components/StreakBadge';
import { ScreenTransition } from '../../components/ScreenTransition';
import { AnimatedTitle } from '../../components/AnimatedTitle';
import { Theme } from '../../constants/Theme';
import { CheckIn } from '../../types';

export default function HomeScreen() {
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [checkInNote, setCheckInNote] = useState('');
  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null);
  const [userStreak] = useState(15);
  const [groupStreak] = useState(8);
  const [lastCheckIn] = useState('3h ago');

  // Mock groups data
  const [groups] = useState([
    { id: '1', name: 'Morning Runners', members: 4, streak: 8 },
    { id: '2', name: 'Gym Buddies', members: 6, streak: 12 },
    { id: '3', name: 'Yoga Flow', members: 3, streak: 5 },
  ]);
  const [selectedGroupId, setSelectedGroupId] = useState('1');
  const selectedGroup = groups.find(g => g.id === selectedGroupId) || groups[0];

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
    <ScreenTransition>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={require('../../assets/images/Teo Jumping.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.groupName}>{selectedGroup.name}</Text>
              <Text style={styles.groupSubtext}>{selectedGroup.members} members</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowGroupSelector(true)}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                stroke="#666666"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </Svg>
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
            <StreakBadge days={selectedGroup.streak} size="small" />
          </View>
        </View>

        {/* Group Feed */}
        <View style={styles.feedSection}>
          <AnimatedTitle style={styles.feedTitle}>Group Feed</AnimatedTitle>
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

      {/* Group Selector Modal */}
      <Modal
        visible={showGroupSelector}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowGroupSelector(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowGroupSelector(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.groupSelectorContent}>
                <Text style={styles.modalTitle}>Select Group</Text>
                <Text style={styles.groupSelectorSubtitle}>
                  Choose which group to display on your home screen
                </Text>

                <View style={styles.groupsList}>
                  {groups.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      style={[
                        styles.groupItem,
                        selectedGroupId === group.id && styles.groupItemSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedGroupId(group.id);
                        setShowGroupSelector(false);
                      }}
                    >
                      <View style={styles.groupItemLeft}>
                        <Text style={styles.groupItemName}>{group.name}</Text>
                        <Text style={styles.groupItemInfo}>
                          {group.members} members • {group.streak} day streak
                        </Text>
                      </View>
                      {selectedGroupId === group.id && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <Button
                  title="Close"
                  onPress={() => setShowGroupSelector(false)}
                  variant="outline"
                  fullWidth
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Check-in Modal */}
      <Modal
        visible={showCheckInModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          Keyboard.dismiss();
          setShowCheckInModal(false);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
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
                  blurOnSubmit={true}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                  }}
                />

                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowCheckInModal(false);
                      setCheckInNote('');
                      setCheckInPhoto(null);
                    }}
                    variant="outline"
                    style={styles.modalButton}
                  />
                  <Button
                    title="Confirm"
                    onPress={() => {
                      Keyboard.dismiss();
                      handleCheckIn();
                    }}
                    style={styles.modalButton}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: Theme.spacing.xs,
  },
  groupName: {
    fontSize: 28,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
  },
  groupSubtext: {
    fontSize: Theme.typography.fontSize.sm,
    color: '#999999',
    marginTop: Theme.spacing.xs,
  },
  settingsIcon: {
    fontSize: 24,
  },
  heroCard: {
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  statusContainer: {
    marginBottom: Theme.spacing.lg,
  },
  statusText: {
    fontSize: Theme.typography.fontSize.lg,
    color: '#666666',
    fontWeight: Theme.typography.fontWeight.medium,
  },
  statusCompleted: {
    color: '#10B981',
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
    color: '#FFFFFF',
  },
  lastCheckIn: {
    fontSize: Theme.typography.fontSize.sm,
    color: '#999999',
  },
  streakSection: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
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
    color: '#666666',
    marginBottom: Theme.spacing.xs,
  },
  streakDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: Theme.spacing.md,
  },
  feedSection: {
    marginTop: Theme.spacing.md,
  },
  feedTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
    marginBottom: Theme.spacing.md,
  },
  feedCard: {
    marginBottom: Theme.spacing.md,
    backgroundColor: '#F5F5F5',
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
    color: '#000000',
    marginBottom: Theme.spacing.xs,
  },
  feedTime: {
    fontSize: Theme.typography.fontSize.sm,
    color: '#999999',
    marginBottom: Theme.spacing.xs,
  },
  feedNote: {
    fontSize: Theme.typography.fontSize.base,
    color: '#666666',
    marginTop: Theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
    marginBottom: Theme.spacing.xl,
  },
  photoButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#8B5CF6',
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
    color: '#8B5CF6',
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
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.base,
    color: '#000000',
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
  groupSelectorContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    margin: Theme.spacing.xl,
    maxHeight: '80%',
  },
  groupSelectorSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: '#666666',
    marginBottom: Theme.spacing.xl,
    marginTop: -Theme.spacing.md,
  },
  groupsList: {
    marginBottom: Theme.spacing.xl,
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  groupItemSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#8B5CF6',
  },
  groupItemLeft: {
    flex: 1,
  },
  groupItemName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: '#000000',
    marginBottom: Theme.spacing.xs,
  },
  groupItemInfo: {
    fontSize: Theme.typography.fontSize.sm,
    color: '#666666',
  },
  checkmark: {
    fontSize: 24,
    color: '#8B5CF6',
    fontWeight: Theme.typography.fontWeight.bold,
  },
});

