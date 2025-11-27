import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ProgressDots } from '../../components/ProgressDots';
import { OnboardingNavigation } from '../../components/OnboardingNavigation';
import { useScrollIndicator } from '../../components/ScrollIndicator';
import { Theme } from '../../constants/Theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useOnboarding } from '../../contexts/OnboardingContext';

const PERSONALITIES = [
  {
    id: 'chill',
    title: 'Chill',
    description: 'Soft reminders, gentle tone',
    emoji: '😌',
  },
  {
    id: 'motivational',
    title: 'Motivational',
    description: 'A bit more push, always positive',
    emoji: '💪',
  },
  {
    id: 'playful',
    title: 'Playful',
    description: 'Fun messages, light jokes',
    emoji: '🎉',
  },
];

export default function PersonalityScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { updateOnboardingData } = useOnboarding();
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const {
    contentHeight,
    viewHeight,
    handleScroll,
    handleContentSizeChange,
    handleLayout,
  } = useScrollIndicator();

  const handleContinue = async () => {
    if (selectedPersonality) {
      await updateOnboardingData({ personality: selectedPersonality });
      router.push('/(onboarding)/training-time');
    }
  };

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        {/* Fixed Progress Dots - Always visible at top */}
        <View style={styles.progressContainer}>
          <ProgressDots total={7} current={3} />
        </View>
        
        {/* Scrollable Content Area */}
        <View style={styles.scrollContainer} onLayout={handleLayout}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onContentSizeChange={handleContentSizeChange}
            scrollEventThrottle={16}
            scrollEnabled={contentHeight > viewHeight + 5 && viewHeight > 0}
          >
            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.text }]}>How should FitBuddy talk to you?</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Choose your notification tone.</Text>

              <View style={styles.cardsContainer}>
                {PERSONALITIES.map((personality) => (
                  <TouchableOpacity
                    key={personality.id}
                    style={[
                      styles.card,
                      {
                        backgroundColor: selectedPersonality === personality.id ? colors.primary + '15' : colors.card,
                        borderColor: selectedPersonality === personality.id ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedPersonality(personality.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emoji}>{personality.emoji}</Text>
                    <View style={styles.cardContent}>
                      <Text style={[
                        styles.cardTitle,
                        { color: selectedPersonality === personality.id ? colors.primary : colors.text },
                      ]}>
                        {personality.title}
                      </Text>
                      <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{personality.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Fixed Navigation Buttons - Always visible at bottom */}
        <View style={styles.navigationContainer}>
          <OnboardingNavigation
            onBack={() => router.back()}
            onNext={handleContinue}
            nextLabel="Next"
            nextDisabled={!selectedPersonality}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xs,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.xl,
    flexGrow: 1,
  },
  content: {
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  navigationContainer: {
    paddingTop: Theme.spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: Theme.spacing.xl,
  },
  cardsContainer: {
    gap: Theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: Theme.spacing.lg,
    borderWidth: 2,
  },
  emoji: {
    fontSize: 40,
    marginRight: Theme.spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
  },
});
