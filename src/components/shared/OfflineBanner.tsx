import { CloudOff } from 'lucide-react-native';
import React from 'react';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useIsOnline } from '@/hooks/use-network';
import { spacing, useTheme } from '@/theme';
import { AppText } from '../ui/AppText';

/**
 * A quiet strip when connectivity drops. Queries pause automatically (TanStack
 * online manager) and refetch on reconnect; cached data stays on screen.
 */
export function OfflineBanner() {
  const isOnline = useIsOnline();
  const { colors } = useTheme();

  if (isOnline) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutUp.duration(200)}
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surfaceHigh,
      }}
    >
      <CloudOff size={14} color={colors.warning} strokeWidth={2} />
      <AppText variant="bodySmall" color="textMuted">
        Offline — showing last known data
      </AppText>
    </Animated.View>
  );
}
