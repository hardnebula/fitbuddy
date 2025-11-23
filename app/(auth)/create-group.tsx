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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Theme } from '../../constants/Theme';

export default function CreateGroupScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Create Your Group</Text>

            <Input
              label="Group Name"
              placeholder="Enter group name"
              value={groupName}
              onChangeText={setGroupName}
              autoCapitalize="words"
            />

            <Text style={styles.description}>
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
              <Card style={styles.membersCard}>
                <Text style={styles.membersTitle}>Members ({members.length}/4)</Text>
                {members.map((member, index) => (
                  <View key={index} style={styles.memberItem}>
                    <Text style={styles.memberText}>{member}</Text>
                  </View>
                ))}
              </Card>
            )}

            <Card style={styles.inviteCard}>
              <Text style={styles.inviteLabel}>Invite Code</Text>
              <TouchableOpacity
                onPress={handleCopyInviteCode}
                style={styles.inviteCodeContainer}
              >
                <Text style={styles.inviteCode}>{inviteCode}</Text>
                <Text style={styles.copyText}>Tap to copy</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
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
  title: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xl,
  },
  description: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.textSecondary,
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
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  memberItem: {
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  memberText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.textSecondary,
  },
  inviteCard: {
    marginBottom: Theme.spacing.xl,
  },
  inviteLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  inviteCodeContainer: {
    alignItems: 'center',
  },
  inviteCode: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  copyText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textTertiary,
  },
  createButton: {
    marginTop: Theme.spacing.lg,
  },
});

