import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';

interface SelectionChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function SelectionChip({ label, selected, onPress, style }: SelectionChipProps) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { 
          backgroundColor: selected ? colors.primary + '15' : colors.card,
          borderColor: selected ? colors.primary : colors.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.chipText,
        { color: selected ? colors.primary : colors.text }
      ]}>
        {label}
      </Text>
      {selected && (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.checkIcon}>
          <Path
            d="M20 6L9 17l-5-5"
            stroke={colors.primary}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    minHeight: 56,
  },
  chipText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
});
