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
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { StoryAvatar } from '../../components/StoryAvatar';
import { StoryModal } from '../../components/StoryModal';
import { AnimatedButton } from '../../components/AnimatedButton';
import { StreakBadge } from '../../components/StreakBadge';
import { ScreenTransition } from '../../components/ScreenTransition';
import { AnimatedTitle } from '../../components/AnimatedTitle';
import { HighFiveCheckInButton } from '../../components/HighFiveCheckInButton';
import { Theme } from '../../constants/Theme';
import { useTheme } from '../../contexts/ThemeContext';
import { CheckIn } from '../../types';

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const [checkedInGroups, setCheckedInGroups] = useState<Set<string>>(new Set());
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInNote, setCheckInNote] = useState('');
  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null);
  const [isPhotoMirrored, setIsPhotoMirrored] = useState(false);
  const [selectedCheckInGroups, setSelectedCheckInGroups] = useState<string[]>([]);
  const [selectedStory, setSelectedStory] = useState<CheckIn | null>(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [userStreak] = useState(7);
  const [lastCheckIn] = useState('Yesterday at 6:30 PM');
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [groupImage, setGroupImage] = useState<string | null>(null);

  // Mock groups data
  const [groups] = useState([
    { id: '1', name: 'Morning Runners', members: 4, streak: 8 },
    { id: '2', name: 'Gym Buddies', members: 6, streak: 12 },
    { id: '3', name: 'Yoga Flow', members: 3, streak: 5 },
  ]);
  const [selectedGroupId, setSelectedGroupId] = useState('1');
  const selectedGroup = groups.find(g => g.id === selectedGroupId) || groups[0];

  // Mock check-ins data - organized by group
  const [checkInsByGroup, setCheckInsByGroup] = useState<Record<string, CheckIn[]>>({
    '1': [
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
    ],
    '2': [],
    '3': [],
  });
  
  // Get check-ins for current group
  const checkIns = checkInsByGroup[selectedGroupId] || [];
  const hasCheckedInToday = checkedInGroups.has(selectedGroupId);

  const handlePickImage = async () => {
    setShowPhotoOptions(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // No cropping
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCheckInPhoto(result.assets[0].uri);
      setIsPhotoMirrored(false);
    }
  };

  const handleTakePhoto = async () => {
    setShowPhotoOptions(false);
    
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false, // No cropping, upload as is
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
      // Flash off by default
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Flip the image horizontally to match the camera preview (Instagram style)
      const flippedImage = await manipulateAsync(
        result.assets[0].uri,
        [{ flip: FlipType.Horizontal }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );
      
      setCheckInPhoto(flippedImage.uri);
      setIsPhotoMirrored(false);
    }
  };

  const handleCheckIn = () => {
    if (!checkInNote.trim() && !checkInPhoto) {
      Alert.alert('Add something', 'Please add a note or photo');
      return;
    }

    if (selectedCheckInGroups.length === 0) {
      Alert.alert('Select a group', 'Please select at least one group to share with');
      return;
    }
    
    // Add new check-in to selected groups
    const newCheckIn: CheckIn = {
      id: Date.now().toString(),
      userId: '1', // Current user ID
      userName: 'You',
      timestamp: new Date(),
      note: checkInNote.trim() || undefined,
      photo: checkInPhoto || undefined,
    };
    
    // Update check-ins for each selected group
    const updatedCheckIns = { ...checkInsByGroup };
    selectedCheckInGroups.forEach(groupId => {
      updatedCheckIns[groupId] = [newCheckIn, ...(updatedCheckIns[groupId] || [])];
    });
    setCheckInsByGroup(updatedCheckIns);
    
    // Mark groups as checked in
    const newCheckedInGroups = new Set(checkedInGroups);
    selectedCheckInGroups.forEach(groupId => newCheckedInGroups.add(groupId));
    setCheckedInGroups(newCheckedInGroups);
    
    setShowCheckInModal(false);
    setCheckInNote('');
    setCheckInPhoto(null);
    setIsPhotoMirrored(false);
    setSelectedCheckInGroups([]);
    
    const groupText = selectedCheckInGroups.length === groups.length 
      ? 'all groups' 
      : selectedCheckInGroups.length === 1 
        ? groups.find(g => g.id === selectedCheckInGroups[0])?.name 
        : `${selectedCheckInGroups.length} groups`;
    
    Alert.alert('Success!', `Check-in shared with ${groupText}! 🔥`, [{ text: 'OK' }]);
  };

  const handleSelectGroupImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setGroupImage(result.assets[0].uri);
    }
  };

  return (
    <ScreenTransition>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Header */}
        <View style={[styles.header]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={handleSelectGroupImage} 
              style={[styles.groupImageContainer, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
            >
              {groupImage ? (
                <Image 
                  source={{ uri: groupImage }} 
                  style={styles.groupImage}
                />
              ) : (
                <View style={styles.groupImagePlaceholder}>
                  <Text style={[styles.groupImagePlaceholderText, { color: colors.textTertiary }]}>+</Text>
                </View>
              )}
            </TouchableOpacity>
            <View>
              <Text style={[styles.groupName, { color: colors.text }]}>{selectedGroup.name}</Text>
              <Text style={[styles.groupSubtext, { color: colors.textTertiary }]}>{selectedGroup.members} members</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowGroupSelector(true)}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                stroke={colors.textSecondary}
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <Card style={StyleSheet.flatten([styles.heroCard, { backgroundColor: colors.cardSecondary }])} glow={hasCheckedInToday}>
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                { color: colors.textSecondary },
                hasCheckedInToday && { color: colors.success },
              ]}
            >
              {hasCheckedInToday ? 'Done for today!' : 'Not Yet'}
            </Text>
          </View>

          <HighFiveCheckInButton
            onPress={() => setShowCheckInModal(true)}
            disabled={hasCheckedInToday}
          />

          <Text style={[styles.lastCheckIn, { color: colors.textTertiary }]}>Last check-in: {lastCheckIn}</Text>
        </Card>

        {/* Streak Section */}
        <View style={[styles.streakSection, { backgroundColor: colors.cardSecondary }]}>
          <View style={styles.streakItem}>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Your Streak</Text>
            <StreakBadge days={userStreak} size="medium" />
          </View>
          <View style={[styles.streakDivider, { backgroundColor: colors.border }]} />
          <View style={styles.streakItem}>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Group Streak</Text>
            <StreakBadge days={selectedGroup.streak} size="small" />
          </View>
        </View>

        {/* Group Feed */}
        <View style={styles.feedSection}>
          <AnimatedTitle style={StyleSheet.flatten([styles.feedTitle, { color: colors.text }])}>Group Feed</AnimatedTitle>
          {checkIns.length === 0 ? (
            <View style={styles.emptyFeedContainer}>
              <Image
                source={require('../../assets/images/Teo sleeping.png')}
                style={styles.emptyFeedImage}
                resizeMode="contain"
              />
              <Text style={[styles.emptyFeedTitle, { color: colors.text }]}>No activity yet</Text>
              <Text style={[styles.emptyFeedMessage, { color: colors.textSecondary }]}>
                Be the first to check in today! 💪
              </Text>
            </View>
          ) : (
            checkIns.map((checkIn) => (
              <Card key={checkIn.id} style={StyleSheet.flatten([styles.feedCard, { backgroundColor: colors.cardSecondary }])}>
                <View style={styles.feedItem}>
                  <StoryAvatar
                    name={checkIn.userName}
                    size={56}
                    hasStory={!!checkIn.photo}
                    onPress={() => {
                      if (checkIn.photo || checkIn.note) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedStory(checkIn);
                      }
                    }}
                  />
                  <View style={styles.feedContent}>
                    <Text style={[styles.feedName, { color: colors.text }]}>{checkIn.userName}</Text>
                    <Text style={[styles.feedTime, { color: colors.textTertiary }]}>
                      {checkIn.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {checkIn.note && (
                      <Text style={[styles.feedNote, { color: colors.textSecondary }]}>{checkIn.note}</Text>
                    )}
                  </View>
                </View>
              </Card>
            ))
          )}
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
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.groupSelectorContent, { backgroundColor: colors.surface }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Group</Text>
                <Text style={[styles.groupSelectorSubtitle, { color: colors.textSecondary }]}>
                  Choose which group to display on your home screen
                </Text>

                <View style={styles.groupsList}>
                  {groups.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      style={[
                        styles.groupItem,
                        { backgroundColor: colors.cardSecondary, borderColor: 'transparent' },
                        selectedGroupId === group.id && { backgroundColor: colors.primary + '15', borderColor: colors.primary },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedGroupId(group.id);
                        setShowGroupSelector(false);
                      }}
                    >
                      <View style={styles.groupItemLeft}>
                        <Text style={[styles.groupItemName, { color: colors.text }]}>{group.name}</Text>
                        <Text style={[styles.groupItemInfo, { color: colors.textSecondary }]}>
                          {group.members} members • {group.streak} day streak
                        </Text>
                      </View>
                      {selectedGroupId === group.id && (
                        <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.groupSelectorActions}>
                  <Button
                    title="Create Group"
                    onPress={() => {
                      setShowGroupSelector(false);
                      // Navigate to create group screen
                      // router.push('/(auth)/create-group');
                    }}
                    fullWidth
                    style={{ marginBottom: Theme.spacing.sm }}
                  />
                  <Button
                    title="Close"
                    onPress={() => setShowGroupSelector(false)}
                    variant="outline"
                    fullWidth
                  />
                </View>
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
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.modalScrollContent}
                  >
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Log Your Activity</Text>

                {/* Group Selection */}
                <View style={styles.groupSelectionContainer}>
                  <Text style={[styles.groupSelectionLabel, { color: colors.textSecondary }]}>Share with:</Text>
                  <View style={styles.groupChipsContainer}>
                    <TouchableOpacity
                      onPress={() => {
                        if (selectedCheckInGroups.length === groups.length) {
                          setSelectedCheckInGroups([]);
                        } else {
                          setSelectedCheckInGroups(groups.map(g => g.id));
                        }
                      }}
                      style={[styles.groupChip, { 
                        backgroundColor: selectedCheckInGroups.length === groups.length ? colors.primary : colors.cardSecondary, 
                        borderColor: selectedCheckInGroups.length === groups.length ? colors.primary : colors.border 
                      }]}
                    >
                      <Text style={[styles.groupChipText, { color: selectedCheckInGroups.length === groups.length ? '#FFFFFF' : colors.text }]}>All</Text>
                    </TouchableOpacity>
                    {groups.map((group) => (
                      <TouchableOpacity
                        key={group.id}
                        onPress={() => {
                          if (selectedCheckInGroups.includes(group.id)) {
                            setSelectedCheckInGroups(selectedCheckInGroups.filter(id => id !== group.id));
                          } else {
                            setSelectedCheckInGroups([...selectedCheckInGroups, group.id]);
                          }
                        }}
                        style={[styles.groupChip, { 
                          backgroundColor: selectedCheckInGroups.includes(group.id) ? colors.primary : colors.cardSecondary, 
                          borderColor: selectedCheckInGroups.includes(group.id) ? colors.primary : colors.border 
                        }]}
                      >
                        <Text style={[styles.groupChipText, { color: selectedCheckInGroups.includes(group.id) ? '#FFFFFF' : colors.text }]}>{group.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {checkInPhoto ? (
                  <View style={styles.photoContainer}>
                    <Image 
                      source={{ uri: checkInPhoto }} 
                      style={styles.photo}
                    />
                    <TouchableOpacity
                      onPress={() => setCheckInPhoto(null)}
                      style={styles.removePhoto}
                    >
                      <Text style={styles.removePhotoText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity
                      onPress={() => setShowPhotoOptions(true)}
                      style={[styles.photoButton, { backgroundColor: colors.cardSecondary, borderColor: colors.primary }]}
                    >
                      <Text style={styles.photoButtonIcon}>📷</Text>
                      <Text style={[styles.photoButtonText, { color: colors.primary }]}>Add Photo</Text>
                    </TouchableOpacity>
                    
                    {showPhotoOptions && (
                      <View style={styles.photoOptionsContainer}>
                        <TouchableOpacity
                          onPress={handleTakePhoto}
                          style={[styles.photoOptionButton, { backgroundColor: colors.primary }]}
                        >
                          <Text style={styles.photoOptionIcon}>📸</Text>
                          <Text style={styles.photoOptionButtonText}>Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handlePickImage}
                          style={[styles.photoOptionButton, { backgroundColor: colors.primary }]}
                        >
                          <Text style={styles.photoOptionIcon}>🖼️</Text>
                          <Text style={styles.photoOptionButtonText}>Gallery</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.noteInputContainer}>
                  <Text style={[styles.noteInputLabel, { color: colors.textSecondary }]}>Note (optional):</Text>
                  <TextInput
                    style={[styles.noteInput, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                    placeholder="How did it go?"
                    placeholderTextColor={colors.textTertiary}
                    value={checkInNote}
                    onChangeText={setCheckInNote}
                    multiline
                    textAlignVertical="top"
                    blurOnSubmit={true}
                    returnKeyType="done"
                  />
                </View>

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
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Story Modal */}
      {selectedStory && (
        <StoryModal
          visible={!!selectedStory}
          onClose={() => setSelectedStory(null)}
          userName={selectedStory.userName}
          photo={selectedStory.photo}
          note={selectedStory.note}
          timestamp={selectedStory.timestamp}
        />
      )}
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
    paddingTop: Theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  groupImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  groupImage: {
    width: 56,
    height: 56,
  },
  groupImagePlaceholder: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupImagePlaceholderText: {
    fontSize: 24,
    color: '#999999',
    fontWeight: '300',
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
  checkInButtonContainer: {
    width: '100%',
    marginBottom: Theme.spacing.md,
    alignItems: 'center',
  },
  checkInButtonImage: {
    width: '100%',
    height: 80,
  },
  checkInButtonImageDisabled: {
    opacity: 0.5,
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
  emptyFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.xl,
  },
  emptyFeedImage: {
    width: 150,
    height: 150,
    marginBottom: Theme.spacing.lg,
  },
  emptyFeedTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  emptyFeedMessage: {
    fontSize: Theme.typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
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
    maxHeight: '85%',
  },
  modalScrollContent: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
    marginBottom: Theme.spacing.lg,
  },
  groupSelectionContainer: {
    marginBottom: Theme.spacing.md,
  },
  groupSelectionLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    marginBottom: Theme.spacing.sm,
  },
  groupChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  groupChip: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1.5,
  },
  groupChipText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  noteInputContainer: {
    marginBottom: Theme.spacing.lg,
  },
  noteInputLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    marginBottom: Theme.spacing.sm,
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
  photoOptionsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  photoOptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.xs,
  },
  photoOptionIcon: {
    fontSize: 20,
  },
  photoOptionButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
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
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
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
  groupSelectorActions: {
    gap: Theme.spacing.sm,
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

