import React, { useEffect } from 'react';
import { DimensionValue, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { radius, useTheme } from '@/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  round?: boolean;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, round, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: round ? height / 2 : radius.sm,
          backgroundColor: colors.skeleton,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}
