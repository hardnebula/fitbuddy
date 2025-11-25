import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Theme } from '../constants/Theme';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
  borderColor?: string;
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 40,
  borderColor = '#8B5CF6',
  showBorder = false,
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: showBorder ? 2 : 0,
          borderColor,
        },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <View style={[styles.initialsContainer, { width: size, height: size }]}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: Theme.typography.fontWeight.bold,
  },
});

