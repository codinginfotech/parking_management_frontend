import React from 'react';
import { ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';
import { AppText } from '../ui/AppText';
import { PressableScale } from '../ui/PressableScale';

function GoogleGlyph({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path
        fill={color}
        d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
      />
    </Svg>
  );
}

interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
}

export function GoogleButton({ onPress, loading }: GoogleButtonProps) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      style={{
        minHeight: MIN_TOUCH + 10,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.hairline,
        backgroundColor: colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color={colors.textMuted} />
      ) : (
        <>
          <GoogleGlyph color={colors.text} />
          <AppText variant="bodyMedium">Continue with Google</AppText>
        </>
      )}
    </PressableScale>
  );
}
