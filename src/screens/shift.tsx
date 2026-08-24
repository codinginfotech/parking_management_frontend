import { router } from '@/navigation/nav';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { PAYMENT_METHOD_OPTIONS } from '@/constants';
import { useActiveLot } from '@/features/dashboard/hooks';
import { useCurrentShift, useEndShift, useStartShift } from '@/features/profile/hooks';
import { apiErrorMessage } from '@/services/api';
import { spacing, useTheme } from '@/theme';
import { formatRupees } from '@/utils/currency';
import { formatDuration, formatTime, minutesSince } from '@/utils/datetime';

export default function ShiftScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const shift = useCurrentShift();
  const startShift = useStartShift();
  const endShift = useEndShift();
  const { lots, activeLot } = useActiveLot();

  const [lotPickerOpen, setLotPickerOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const current = shift.data;
  const lotName =
    current && typeof current.lot === 'object' ? current.lot.name : activeLot?.name;

  const begin = (lotId: string) => {
    startShift.mutate(
      { lotId },
      {
        onSuccess: () => {
          void shift.refetch();
          toast.show('success', 'Shift started');
          setLotPickerOpen(false);
        },
        onError: (error) => toast.show('error', 'Could not start shift', apiErrorMessage(error)),
      }
    );
  };

  return (
    <Screen refreshing={shift.isRefetching} onRefresh={() => void shift.refetch()}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingTop: spacing.lg }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12}>
          <ArrowLeft size={22} color={colors.textMuted} />
        </Pressable>
        <AppText variant="headingXL">My shift</AppText>
      </View>

      {shift.isLoading ? (
        <View style={{ gap: spacing.lg, marginTop: spacing.xxl }}>
          <Skeleton height={80} />
          <Skeleton height={200} />
        </View>
      ) : current ? (
        <View style={{ marginTop: spacing.xxl }}>
          <AppText variant="label" color="textMuted">
            On shift at {lotName ?? 'your lot'}
          </AppText>
          <AppText variant="display" style={{ marginTop: spacing.sm }}>
            {formatDuration(minutesSince(current.startTime))}
          </AppText>
          <AppText variant="bodySmall" color="textFaint" style={{ marginTop: spacing.xs }}>
            Started at {formatTime(current.startTime)}
          </AppText>

          <Divider style={{ marginVertical: spacing.xxl }} />

          <AppText variant="label" color="textMuted">
            Collected this shift
          </AppText>
          <AnimatedNumber
            value={current.totalCollected}
            format="inr"
            prefix="â‚¹"
            style={{ fontSize: 40, lineHeight: 48, marginTop: spacing.xs }}
          />

          <View style={{ marginTop: spacing.xl }}>
            {PAYMENT_METHOD_OPTIONS.map(({ value, label }, index) => (
              <View key={value}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: spacing.md,
                  }}
                >
                  <AppText variant="body" color="textMuted">
                    {label}
                  </AppText>
                  <AppText variant="numeric">
                    {formatRupees(current.collections[value] ?? 0)}
                  </AppText>
                </View>
                {index < PAYMENT_METHOD_OPTIONS.length - 1 ? <Divider /> : null}
              </View>
            ))}
          </View>

          <AppText variant="bodySmall" color="textFaint" style={{ marginTop: spacing.lg }}>
            {current.sessionsStarted} entries Â· {current.sessionsClosed} exits handled
          </AppText>

          <Button
            title="End shift"
            variant="danger"
            onPress={() => setConfirmEnd(true)}
            style={{ marginTop: spacing.xxl }}
          />
        </View>
      ) : (
        <View style={{ marginTop: spacing.xxl }}>
          <AppText variant="headingL">You're off shift.</AppText>
          <AppText variant="body" color="textMuted" style={{ marginTop: spacing.sm }}>
            Start a shift so your collections and activity are tracked to you.
          </AppText>
          <Button
            title="Start shift"
            onPress={() => {
              if (lots.length === 1 && lots[0]) begin(lots[0]._id);
              else setLotPickerOpen(true);
            }}
            loading={startShift.isPending}
            style={{ marginTop: spacing.xxl }}
          />
        </View>
      )}

      <Sheet visible={lotPickerOpen} onClose={() => setLotPickerOpen(false)} title="Which lot?">
        {lots.map((lot, index) => (
          <ListRow
            key={lot._id}
            title={lot.name}
            divider={index < lots.length - 1}
            onPress={() => begin(lot._id)}
          />
        ))}
      </Sheet>

      <Sheet visible={confirmEnd} onClose={() => setConfirmEnd(false)} title="End shift?">
        <AppText variant="body" color="textMuted" style={{ marginBottom: spacing.xl }}>
          Your collection summary will be closed at{' '}
          {formatRupees(current?.totalCollected ?? 0)}.
        </AppText>
        <Button
          title="End shift"
          variant="danger"
          loading={endShift.isPending}
          onPress={() =>
            endShift.mutate(undefined, {
              onSuccess: (closed) => {
                setConfirmEnd(false);
                void shift.refetch();
                toast.show(
                  'success',
                  'Shift ended',
                  `${formatRupees(closed.totalCollected)} collected`
                );
              },
              onError: (error) => toast.show('error', 'Could not end shift', apiErrorMessage(error)),
            })
          }
        />
        <Button
          title="Keep working"
          variant="ghost"
          onPress={() => setConfirmEnd(false)}
          style={{ marginTop: spacing.sm }}
        />
      </Sheet>
    </Screen>
  );
}
