import React, { useEffect } from 'react';
import { TextInput, TextInputProps, TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { formatINR } from '@/utils/currency';
import { Palette, typography, TypographyVariant, useTheme } from '@/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedNumberProps {
  value: number;
  /** "inr" applies Indian digit grouping (1,23,456). */
  format?: 'inr' | 'plain';
  prefix?: string;
  suffix?: string;
  variant?: TypographyVariant;
  color?: keyof Palette;
  duration?: number;
  style?: TextStyle;
}

/**
 * Animates numeric changes on the UI thread (revenue, occupancy, amounts)
 * without re-rendering React on every frame.
 */
export function AnimatedNumber({
  value,
  format = 'plain',
  prefix = '',
  suffix = '',
  variant = 'numericL',
  color = 'text',
  duration = 700,
  style,
}: AnimatedNumberProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(value);

  useEffect(() => {
    progress.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, progress]);

  const animatedProps = useAnimatedProps(() => {
    const current = Math.round(progress.value);
    const text = format === 'inr' ? formatINR(current) : current.toString();
    // `text` drives TextInput natively but is missing from TextInputProps.
    return { text: `${prefix}${text}${suffix}` } as unknown as TextInputProps;
  });

  const initial =
    format === 'inr' ? formatINR(value) : Math.round(value).toString();

  return (
    <AnimatedTextInput
      editable={false}
      value={`${prefix}${initial}${suffix}`}
      animatedProps={animatedProps}
      accessibilityLabel={`${prefix}${initial}${suffix}`}
      style={[
        typography[variant],
        { color: colors[color], padding: 0 },
        style,
      ]}
    />
  );
}
