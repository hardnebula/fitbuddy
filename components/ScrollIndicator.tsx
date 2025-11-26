import React, { useState } from 'react';
import { View, StyleSheet, NativeScrollEvent, NativeSyntheticEvent, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ScrollIndicatorProps {
  scrollPosition: number;
  contentHeight: number;
  viewHeight: number;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ 
  scrollPosition,
  contentHeight,
  viewHeight,
}) => {
  const { colors } = useTheme();

  // Don't show if content fits in view
  if (contentHeight <= viewHeight) return null;

  // Calculate scrollbar height and position
  const scrollbarHeight = Math.max((viewHeight / contentHeight) * viewHeight, 40);
  const scrollbarPosition = (scrollPosition / (contentHeight - viewHeight)) * (viewHeight - scrollbarHeight);

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.scrollbar,
          {
            height: scrollbarHeight,
            top: scrollbarPosition,
            backgroundColor: colors.textTertiary,
          }
        ]}
      />
    </View>
  );
};

export const useScrollIndicator = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setScrollPosition(contentOffset.y);
    setContentHeight(contentSize.height);
    setViewHeight(layoutMeasurement.height);
  };

  const handleContentSizeChange = (width: number, height: number) => {
    setContentHeight(height);
  };

  const handleLayout = (event: any) => {
    setViewHeight(event.nativeEvent.layout.height);
  };

  return {
    scrollPosition,
    contentHeight,
    viewHeight,
    handleScroll,
    handleContentSizeChange,
    handleLayout,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    width: 4,
    zIndex: 10,
  },
  scrollbar: {
    position: 'absolute',
    right: 0,
    width: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
});
