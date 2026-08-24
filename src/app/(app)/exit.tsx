import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { PaymentMethodSelector } from '@/components/parking/PaymentMethodSelector';
import { PlateBadge } from '@/components/parking/PlateBadge';
import { PlateInput } from '@/components/parking/PlateInput';
import { SuccessCheck } from '@/components/parking/SuccessCheck';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { useSessionPreview, useVehicleExit, useVehicleLookup } from '@/features/parking/hooks';
import { apiErrorMessage } from '@/services/api';
import type { ExitResult } from '@/services/parking.service';
import { spacing, useTheme } from '@/theme';
import { formatRupees } from '@/utils/currency';
import { formatDuration, formatTime, minutesSince } from '@/utils/datetime';
import { normalizePlate } from '@/utils/plate';
import type { ParkingSession, PaymentMethod } from '@/types/models';

function useTick(intervalMs: number): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return tick;
}

export default function ExitScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const params = useLocalSearchParams<{ sessionId?: string }>();

  const [plate, setPlate] = useState('');
  const [session, setSession] = useState<ParkingSession | null>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [result, setResult] = useState<ExitResult | null>(null);

  const preview = useSessionPreview(params.sessionId);
  const lookup = useVehicleLookup();
  const exit = useVehicleExit();

  useEffect(() => {
    if (preview.data) setSession(preview.data);
  }, [preview.data]);

  useTick(15000); // refresh the live duration line

  const search = () => {
    lookup.mutate(normalizePlate(plate), {
      onSuccess: (found) => setSession(found),
      onError: (error) => toast.show('error', 'Not found', apiErrorMessage(error)),
    });
  };

  const collect = () => {
    if (!session) return;
    const amount = session.currentAmount ?? 0;
    if (amount > 0 && !method) {
      toast.show('info', 'Select a payment method');
      return;
    }
    exit.mutate(
      { sessionId: session._id, paymentMethod: amount > 0 ? (method ?? undefined) : undefined },
      {
        onSuccess: (data) => setResult(data),
        onError: (error) => toast.show('error', 'Exit failed', apiErrorMessage(error)),
      }
    );
  };

  // --- Success state ---
  if (result) {
    const paid = result.payment;
    return (
      <Screen contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', gap: spacing.lg }}>
          <SuccessCheck />
          <Animated.View entering={FadeInUp.delay(150).duration(400)} style={{ alignItems: 'center' }}>
            {paid ? (
              <AppText variant="display">{formatRupees(paid.amount)} Paid</AppText>
            ) : (
              <AppText variant="display">Exit complete</AppText>
            )}
            <AppText variant="headingM" color="textMuted" style={{ marginTop: spacing.md }} align="center">
              Parking complete.{'\n'}Have a great day.
            </AppText>
          </Animated.View>
          <Animated.View entering={FadeIn.delay(400).duration(400)} style={{ alignItems: 'center' }}>
            <AppText variant="bodySmall" color="textFaint">
              {result.session.displayNumber} ·{' '}
              {formatDuration(result.session.durationMinutes ?? 0)}
              {result.session.coveredByPass ? ' · Monthly pass' : ''}
            </AppText>
            {paid ? (
              <AppText variant="bodySmall" color="textFaint" style={{ marginTop: spacing.xs }}>
                Receipt {paid.receiptNumber} · {paid.method}
              </AppText>
            ) : null}
          </Animated.View>
        </View>
        <Button title="Done" onPress={() => router.back()} style={{ marginTop: spacing.xxxl }} />
      </Screen>
    );
  }

  // --- Search state ---
  if (!session) {
    return (
      <Screen keyboardAvoiding>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: spacing.lg,
          }}
        >
          <AppText variant="headingXL">Vehicle exit</AppText>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
            <X size={24} color={colors.textMuted} />
          </Pressable>
        </View>
        <AppText variant="body" color="textMuted" style={{ marginTop: spacing.sm }}>
          Enter the vehicle number to find its parking session.
        </AppText>
        <Animated.View entering={FadeInDown.duration(350)} style={{ marginTop: spacing.xxl }}>
          <PlateInput value={plate} onChange={setPlate} autoFocus />
        </Animated.View>
        <Button
          title="Find vehicle"
          onPress={search}
          disabled={normalizePlate(plate).length < 4}
          loading={lookup.isPending || preview.isLoading}
          style={{ marginTop: spacing.xxl }}
        />
      </Screen>
    );
  }

  // --- Checkout state ---
  const liveDuration = session.durationMinutes ?? minutesSince(session.entryTime);
  const amount = session.coveredByPass ? 0 : (session.currentAmount ?? 0);

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: spacing.lg,
        }}
      >
        <AppText variant="headingXL">Vehicle exit</AppText>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
          <X size={24} color={colors.textMuted} />
        </Pressable>
      </View>

      <Animated.View
        entering={FadeInDown.duration(350)}
        style={{ marginTop: spacing.xxl, alignItems: 'center' }}
      >
        <PlateBadge number={session.displayNumber} />
        <AppText variant="bodySmall" color="textMuted" style={{ marginTop: spacing.md }}>
          {session.lotName ?? ''}
          {session.slotCode ? ` · Slot ${session.slotCode}` : ''}
        </AppText>
      </Animated.View>

      <View style={{ marginTop: spacing.xxl, gap: spacing.xl }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <AppText variant="label" color="textMuted">
              Parked for
            </AppText>
            <AppText variant="numericL" style={{ marginTop: spacing.xs }}>
              {formatDuration(liveDuration)}
            </AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="label" color="textMuted">
              Entry
            </AppText>
            <AppText variant="numericL" style={{ marginTop: spacing.xs }}>
              {formatTime(session.entryTime)}
            </AppText>
          </View>
        </View>

        <Divider />

        <Animated.View entering={FadeInUp.delay(150).duration(500)}>
          <AppText variant="label" color="textMuted">
            Amount
          </AppText>
          {session.coveredByPass ? (
            <>
              <AppText variant="display" style={{ marginTop: spacing.xs }}>
                ₹0
              </AppText>
              <AppText variant="bodyMedium" color="accent" style={{ marginTop: spacing.xs }}>
                Covered by monthly pass
              </AppText>
            </>
          ) : (
            <AnimatedNumber
              value={amount}
              format="inr"
              prefix="₹"
              duration={900}
              variant="numericL"
              style={{ fontSize: 46, lineHeight: 54, marginTop: spacing.xs }}
            />
          )}
        </Animated.View>

        {amount > 0 ? (
          <View>
            <AppText variant="label" color="textMuted" style={{ marginBottom: spacing.md }}>
              Payment method
            </AppText>
            <PaymentMethodSelector value={method} onChange={setMethod} />
          </View>
        ) : null}
      </View>

      <Button
        title={amount > 0 ? `Collect ${formatRupees(amount)}` : 'Complete exit'}
        onPress={collect}
        loading={exit.isPending}
        disabled={amount > 0 && !method}
        style={{ marginTop: spacing.xxxl }}
      />
    </Screen>
  );
}
