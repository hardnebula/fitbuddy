import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/Theme';

export default function SettingsScreen() {
  const [userName] = useState('Luna');
  const [userEmail] = useState('vicentemoravalero@gmail.com');
  const [subscriptionActive] = useState(true);
  const [expirationDate] = useState('9 December 2025');

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change functionality coming soon');
  };

  const handleSubscribe = () => {
    Alert.alert('Subscribe', 'Subscription management coming soon');
  };

  const handleRecheck = () => {
    Alert.alert('Re-check', 'Checking subscription status...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>Settings</Text>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🤑</Text>
          </View>
        </View>

        {/* Account Settings Section */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Name</Text>
            <Text style={styles.settingValue}>{userName}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Email</Text>
            <Text style={styles.settingValue}>{userEmail}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.card} onPress={handleChangePassword}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Change password</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Subscription Section */}
        <Text style={styles.sectionTitle}>Subscription</Text>

        <View style={styles.card}>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionEmoji}>🤑</Text>
            <View>
              <Text style={styles.subscriptionStatus}>
                Subscription active (Trial)
              </Text>
              <Text style={styles.subscriptionDate}>
                Expiration Date: {expirationDate}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.card} onPress={handleSubscribe}>
          <View style={styles.settingRow}>
            <View style={styles.subscribeRow}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={styles.settingLabel}>Subscribe</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleRecheck}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Re-check Subscription Status</Text>
            <Text style={styles.refreshIcon}>↻</Text>
          </View>
        </TouchableOpacity>

        {/* App Settings Section */}
        <Text style={styles.sectionTitle}>App Settings</Text>
      </ScrollView>
    </SafeAreaView>
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
    marginBottom: Theme.spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: '#000000',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: Theme.typography.fontSize.base,
    color: '#000000',
    fontWeight: Theme.typography.fontWeight.normal,
  },
  settingValue: {
    fontSize: Theme.typography.fontSize.base,
    color: '#999999',
    fontWeight: Theme.typography.fontWeight.normal,
  },
  chevron: {
    fontSize: 24,
    color: '#999999',
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  subscriptionEmoji: {
    fontSize: 32,
  },
  subscriptionStatus: {
    fontSize: Theme.typography.fontSize.base,
    color: '#6366F1',
    fontWeight: Theme.typography.fontWeight.semibold,
    marginBottom: 4,
  },
  subscriptionDate: {
    fontSize: Theme.typography.fontSize.sm,
    color: '#999999',
  },
  subscribeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  starEmoji: {
    fontSize: 20,
  },
  refreshIcon: {
    fontSize: 20,
    color: '#999999',
  },
});

