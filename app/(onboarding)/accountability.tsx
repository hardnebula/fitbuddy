import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectionChip } from '../../components/SelectionChip';
import { ProgressDots } from '../../components/ProgressDots';
import { OnboardingNavigation } from '../../components/OnboardingNavigation';
import { ScrollIndicator, useScrollIndicator } from '../../components/ScrollIndicator';
import { Theme } from '../../constants/Theme';
import { useTheme } from '../../contexts/ThemeContext';

const CIRCLES = [
  '👥 Friends',
  '💑 Partner',
  '👨‍👩‍👧‍👦 Family',
  '💼 Coworkers',
  '🎯 Coach',
  "🔍 I don't have a group yet",
];

export default function AccountabilityScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const { scrollPosition, contentHeight, viewHeight, handleScroll, handleContentSizeChange, handleLayout } = useScrollIndicator();

  const handleContinue = () => {
    if (selectedCircle) {
      router.push('/(onboarding)/personality');
    }
  };

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ProgressDots total={7} current={2} />
        
        <View style={{ flex: 1 }} onLayout={handleLayout}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onContentSizeChange={handleContentSizeChange}
            scrollEventThrottle={16}
          >
            <View style={styles.content}>
              <Image
                source={require('../../assets/images/Onboarding/HighFiveteoandsirius.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: colors.text }]}>Who do you want to train with?</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>FitBuddy works best with small, close groups.</Text>

              <View style={styles.chipsContainer}>
                {CIRCLES.map((circle) => (
                  <View key={circle} style={styles.chipWrapper}>
                    <SelectionChip
                      label={circle}
                      selected={selectedCircle === circle}
                      onPress={() => setSelectedCircle(circle)}
                    />
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <ScrollIndicator 
            scrollPosition={scrollPosition}
            contentHeight={contentHeight}
            viewHeight={viewHeight}
          />
        </View>

        <OnboardingNavigation
          onBack={() => router.back()}
          onNext={handleContinue}
          nextLabel="Next"
          nextDisabled={!selectedCircle}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.xl,
  },
  content: {
    paddingTop: Theme.spacing.md,
  },
  illustration: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: Theme.spacing.md,
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
  chipsContainer: {
    gap: Theme.spacing.md,
  },
  chipWrapper: {
    width: '100%',
  },
});
