import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { haptics } from '@/hooks/use-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  style?: ViewStyle | ViewStyle[];
  haptic?: boolean;
  scaleTo?: number;
}

/** The standard press affordance: a subtle scale-down with optional haptic. */
export function PressableScale({
  style,
  haptic = true,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      style={[animatedStyle, style]}
      onPressIn={(event) => {
        scale.value = withTiming(scaleTo, { duration: 90 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, { duration: 140 });
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (haptic) haptics.tap();
        onPress?.(event);
      }}
    />
  );
}
