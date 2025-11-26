import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Logo } from '../../components/Logo';
import { Theme } from '../../constants/Theme';

export default function JoinGroupScreen() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');

  const handleJoinGroup = () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }
    // In a real app, validate the code with backend
    // For now, navigate to main app
    router.replace('/(tabs)/home');
  };

  // Mock group preview data
  const groupPreview = {
    name: 'Morning Runners',
    members: 3,
    streak: 8,
  };

  return (
    <>
    <StatusBar barStyle="dark-content" />
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
              <Text style={styles.title}>Join Group</Text>
            </View>

            <Input
              label="Invite Code"
              placeholder="Enter invite code"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              containerStyle={styles.inputContainer}
            />

            {inviteCode.length > 0 && (
              <Card style={styles.previewCard} glow>
                <Text style={styles.previewTitle}>Group Preview</Text>
                <View style={styles.previewContent}>
                  <Text style={styles.groupName}>{groupPreview.name}</Text>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Members:</Text>
                    <Text style={styles.previewValue}>{groupPreview.members}</Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Group Streak:</Text>
                    <Text style={[styles.previewValue, styles.streak]}>
                      {groupPreview.streak} days 🔥
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            <Button
              title="Join Group"
              onPress={handleJoinGroup}
              fullWidth
              size="large"
              style={styles.joinButton}
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
  inputContainer: {
    marginBottom: Theme.spacing.xl,
  },
  previewCard: {
    marginBottom: Theme.spacing.xl,
    backgroundColor: '#F5F5F5',
  },
  previewTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: '#000000',
    marginBottom: Theme.spacing.md,
  },
  previewContent: {
    gap: Theme.spacing.sm,
  },
  groupName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#000000',
    marginBottom: Theme.spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: Theme.typography.fontSize.base,
    color: '#666666',
  },
  previewValue: {
    fontSize: Theme.typography.fontSize.base,
    color: '#000000',
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  streak: {
    color: '#8B5CF6',
  },
  joinButton: {
    marginTop: Theme.spacing.lg,
  },
});

