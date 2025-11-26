import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../constants/Theme';
import { useTheme } from '../contexts/ThemeContext';

interface StoryAvatarProps {
  uri?: string;
  name: string;
  size?: number;
  hasStory?: boolean;
  onPress?: () => void;
}

export const StoryAvatar: React.FC<StoryAvatarProps> = ({
  uri,
  name,
  size = 48,
  hasStory = false,
  onPress,
}) => {
  const { colors } = useTheme();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const borderWidth = 3;
  const innerSize = size - borderWidth * 2;

  const content = (
    <View style={[styles.container, { width: size, height: size }]}>
      {hasStory ? (
        <LinearGradient
          colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientBorder, { width: size, height: size, borderRadius: size / 2 }]}
        >
          <View
            style={[
              styles.innerContainer,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
                backgroundColor: colors.background,
              },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                {
                  width: innerSize - 4,
                  height: innerSize - 4,
                  borderRadius: (innerSize - 4) / 2,
                },
              ]}
            >
              {uri ? (
                <Image source={{ uri }} style={styles.image} />
              ) : (
                <View style={[styles.initialsContainer, { backgroundColor: colors.primary }]}>
                  <Text
                    style={[
                      styles.initials,
                      { fontSize: (innerSize - 4) * 0.4 },
                    ]}
                  >
                    {initials}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.noBorderContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: colors.border,
            },
          ]}
        >
          {uri ? (
            <Image source={{ uri }} style={styles.image} />
          ) : (
            <View style={[styles.initialsContainer, { backgroundColor: colors.primary }]}>
              <Text
                style={[
                  styles.initials,
                  { fontSize: size * 0.4 },
                ]}
              >
                {initials}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBorder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  innerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    overflow: 'hidden',
  },
  noBorderContainer: {
    overflow: 'hidden',
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: Theme.typography.fontWeight.bold,
  },
});
