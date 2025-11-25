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
import { Logo } from '../../components/Logo';
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
            <View style={styles.header}>
              <Logo size={80} style={styles.logo} />
              <Text style={styles.title}>Create Your Group</Text>
            </View>

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
    backgroundColor: '#FFFFFF',
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
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  logo: {
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
  },
  description: {
    fontSize: Theme.typography.fontSize.base,
    color: '#666666',
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
    backgroundColor: '#F5F5F5',
  },
  membersTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: '#000000',
    marginBottom: Theme.spacing.md,
  },
  memberItem: {
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  memberText: {
    fontSize: Theme.typography.fontSize.base,
    color: '#666666',
  },
  inviteCard: {
    marginBottom: Theme.spacing.xl,
    backgroundColor: '#F5F5F5',
  },
  inviteLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: '#666666',
    marginBottom: Theme.spacing.sm,
  },
  inviteCodeContainer: {
    alignItems: 'center',
  },
  inviteCode: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#8B5CF6',
    marginBottom: Theme.spacing.xs,
  },
  copyText: {
    fontSize: Theme.typography.fontSize.xs,
    color: '#999999',
  },
  createButton: {
    marginTop: Theme.spacing.lg,
  },
});

