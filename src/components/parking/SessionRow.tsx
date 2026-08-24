import React from 'react';
import { View } from 'react-native';
import { VEHICLE_TYPE_LABELS } from '@/constants';
import { spacing, useTheme } from '@/theme';
import type { ParkingSession } from '@/types/models';
import { formatRupees } from '@/utils/currency';
import { formatDuration, minutesSince } from '@/utils/datetime';
import { AppText } from '../ui/AppText';
import { Divider } from '../ui/Divider';
import { PressableScale } from '../ui/PressableScale';

interface SessionRowProps {
  session: ParkingSession;
  onPress: () => void;
  showLot?: boolean;
}

/**
 * A live-session line built from typography and one hairline — plate first,
 * duration and estimate on the right. No card.
 */
export function SessionRow({ session, onPress, showLot = false }: SessionRowProps) {
  const { colors } = useTheme();
  const duration = session.durationMinutes ?? minutesSince(session.entryTime);
  const meta = [
    VEHICLE_TYPE_LABELS[session.vehicleType],
    session.slotCode,
    showLot ? session.lotName : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View>
      <PressableScale
        scaleTo={0.99}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${session.displayNumber}, parked ${formatDuration(duration)}`}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.lg,
            gap: spacing.lg,
          }}
        >
          <View style={{ flex: 1 }}>
            <AppText variant="headingM" style={{ letterSpacing: 1 }}>
              {session.displayNumber}
            </AppText>
            <AppText variant="bodySmall" color="textMuted" style={{ marginTop: 3 }}>
              {meta}
            </AppText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <AppText variant="numeric">{formatDuration(duration)}</AppText>
            {session.coveredByPass ? (
              <AppText variant="bodySmall" color={colors.accent} style={{ marginTop: 3 }}>
                Pass
              </AppText>
            ) : (
              <AppText variant="bodySmall" color="textMuted" style={{ marginTop: 3 }}>
                {formatRupees(session.estimatedAmount ?? 0)} est.
              </AppText>
            )}
          </View>
        </View>
      </PressableScale>
      <Divider />
    </View>
  );
}
