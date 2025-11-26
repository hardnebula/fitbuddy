import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Theme } from '../../constants/Theme';
import { useTheme } from '../../contexts/ThemeContext';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState('');
  const [inviteCode] = useState('FITBUDDY-' + Math.random().toString(36).substr(2, 6).toUpperCase());

  const handleAddMember = () => {
    if (memberInput.trim() && members.length < 4) {
      setMembers([...members, memberInput.trim()]);
      setMemberInput('');
    }
  };

  const handleCopyInviteCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    // Navigate to main app
    router.replace('/(tabs)/home');
  };

  return (
    <>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Text style={[styles.backButtonText, { color: colors.text }]}>← Back</Text>
            </TouchableOpacity>
            
            <View style={styles.header}>
              <Image 
                source={require('../../assets/images/Teo Treadmill-Photoroom.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: colors.text }]}>Create Your Group</Text>
            </View>

            <Input
              label="Group Name"
              placeholder="Enter group name"
              value={groupName}
              onChangeText={setGroupName}
              autoCapitalize="words"
            />

            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Invite up to 4 friends
            </Text>

            <View style={styles.addMemberContainer}>
              <Input
                placeholder="Friend's name or email"
                value={memberInput}
                onChangeText={setMemberInput}
                containerStyle={styles.memberInput}
                style={{ flex: 1 }}
              />
              <Button
                title="+ Add"
                onPress={handleAddMember}
                disabled={!memberInput.trim() || members.length >= 4}
                size="small"
              />
            </View>

            {members.length > 0 && (
              <Card style={StyleSheet.flatten([styles.membersCard, { backgroundColor: colors.cardSecondary }])}>
                <Text style={[styles.membersTitle, { color: colors.text }]}>Members ({members.length}/4)</Text>
                {members.map((member, index) => (
                  <View key={index} style={[styles.memberItem, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.memberText, { color: colors.textSecondary }]}>{member}</Text>
                  </View>
                ))}
              </Card>
            )}

            <Card style={StyleSheet.flatten([styles.inviteCard, { backgroundColor: colors.cardSecondary }])}>
              <Text style={[styles.inviteLabel, { color: colors.textSecondary }]}>Invite Code</Text>
              <TouchableOpacity
                onPress={handleCopyInviteCode}
                style={styles.inviteCodeContainer}
              >
                <Text style={[styles.inviteCode, { color: colors.primary }]}>{inviteCode}</Text>
                <Text style={[styles.copyText, { color: colors.textTertiary }]}>Tap to copy</Text>
              </TouchableOpacity>
            </Card>

            <Button
              title="Create Group"
              onPress={handleCreateGroup}
              fullWidth
              size="large"
              style={styles.createButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: Theme.spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
  },
  backButtonText: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  description: {
    fontSize: Theme.typography.fontSize.base,
    marginBottom: Theme.spacing.md,
  },
  addMemberContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    alignItems: 'flex-end',
    marginBottom: Theme.spacing.lg,
  },
  memberInput: {
    flex: 1,
    marginBottom: 0,
  },
  membersCard: {
    marginBottom: Theme.spacing.lg,
  },
  membersTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.semibold,
    marginBottom: Theme.spacing.md,
  },
  memberItem: {
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
  },
  memberText: {
    fontSize: Theme.typography.fontSize.base,
  },
  inviteCard: {
    marginBottom: Theme.spacing.xl,
  },
  inviteLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  inviteCodeContainer: {
    alignItems: 'center',
  },
  inviteCode: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  copyText: {
    fontSize: Theme.typography.fontSize.xs,
  },
  createButton: {
    marginTop: Theme.spacing.lg,
  },
});

