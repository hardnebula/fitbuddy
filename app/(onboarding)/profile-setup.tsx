import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '../../components/Input';
import { ProgressDots } from '../../components/ProgressDots';
import { OnboardingNavigation } from '../../components/OnboardingNavigation';
import { Theme } from '../../constants/Theme';
import { useTheme } from '../../contexts/ThemeContext';

const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { colors, isDark, setTheme, theme } = useTheme();
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(isDark ? 'dark' : 'light');

  // Inicializar con el tema actual
  useEffect(() => {
    const currentTheme = theme === 'system' ? (isDark ? 'dark' : 'light') : theme as 'light' | 'dark';
    setSelectedTheme(currentTheme);
  }, []);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setSelectedTheme(newTheme);
    // Cambiar el tema inmediatamente
    setTheme(newTheme);
  };

  const handleFinish = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    // El tema ya está guardado por handleThemeChange
    router.push('/(onboarding)/final');
  };

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ProgressDots total={7} current={5} />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>Set up your profile</Text>

            {/* Photo Picker */}
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={handlePickPhoto}
              activeOpacity={0.7}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <View style={[styles.photoPlaceholder, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
                  <Text style={[styles.photoPlaceholderText, { color: colors.textTertiary }]}>+</Text>
                  <Text style={[styles.photoLabel, { color: colors.textTertiary }]}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Name Input */}
            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              autoCapitalize="words"
            />

            {/* Theme Selector */}
            <View style={styles.themeSection}>
              <Text style={[styles.themeLabel, { color: colors.text }]}>Theme</Text>
              <View style={styles.themeOptions}>
                {THEMES.map((theme) => (
                  <TouchableOpacity
                    key={theme.id}
                    style={[
                      styles.themeChip,
                      { 
                        backgroundColor: selectedTheme === theme.id ? colors.primary + '15' : colors.cardSecondary,
                        borderColor: selectedTheme === theme.id ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleThemeChange(theme.id as 'light' | 'dark')}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.themeChipText,
                      { color: selectedTheme === theme.id ? colors.primary : colors.text },
                    ]}>
                      {theme.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <OnboardingNavigation
          onBack={() => router.back()}
          onNext={handleFinish}
          nextLabel="Finish"
          nextDisabled={!name.trim()}
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
    paddingTop: Theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Theme.spacing.xl,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: Theme.spacing.xl,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 32,
    fontWeight: '300',
  },
  photoLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  themeSection: {
    marginTop: Theme.spacing.xl,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Theme.spacing.md,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  themeChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  themeChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
