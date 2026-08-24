import { Check } from 'lucide-react-native';
import React from 'react';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/theme';

/** The satisfying confirmation moment after entry, exit, or payment. */
export function SuccessCheck({ size = 88 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <Animated.View
      entering={ZoomIn.springify().damping(13).stiffness(160)}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityLabel="Success"
    >
      <Animated.View entering={FadeIn.delay(180).duration(250)}>
        <Check size={size * 0.45} color={colors.onAccent} strokeWidth={3} />
      </Animated.View>
    </Animated.View>
  );
}
