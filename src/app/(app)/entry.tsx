import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ParkingSlip } from '@/components/parking/ParkingSlip';
import { PlateInput } from '@/components/parking/PlateInput';
import { SuccessCheck } from '@/components/parking/SuccessCheck';
import { VehicleTypeSelector } from '@/components/parking/VehicleTypeSelector';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { useActiveLot } from '@/features/dashboard/hooks';
import { useAvailableSlots, useVehicleEntry } from '@/features/parking/hooks';
import { apiErrorMessage } from '@/services/api';
import type { EntryResult } from '@/services/parking.service';
import { useAuthStore } from '@/store/auth.store';
import { spacing, useTheme } from '@/theme';
import { normalizePlate } from '@/utils/plate';
import type { Slot, VehicleType } from '@/types/models';

export default function EntryScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const businessName = useAuthStore((state) => state.user?.business?.name);
  const { activeLot } = useActiveLot();
  const entry = useVehicleEntry();
  const slots = useAvailableSlots(activeLot?._id);

  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [slotSheetOpen, setSlotSheetOpen] = useState(false);
  const [result, setResult] = useState<EntryResult | null>(null);

  const plateValue = normalizePlate(plate);
  const canSubmit = plateValue.length >= 4 && vehicleType !== null && Boolean(activeLot);

  const submit = () => {
    if (!activeLot || !vehicleType) return;
    entry.mutate(
      {
        lotId: activeLot._id,
        vehicleNumber: plateValue,
        vehicleType,
        slotId: selectedSlot?._id,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: (data) => setResult(data),
        onError: (error) => toast.show('error', 'Entry failed', apiErrorMessage(error)),
      }
    );
  };

  const reset = () => {
    setPlate('');
    setVehicleType(null);
    setSelectedSlot(null);
    setNotes('');
    setShowNotes(false);
    setResult(null);
  };

  if (result) {
    const { session, occupancy } = result;
    return (
      <Screen>
        <View style={{ alignItems: 'center', paddingTop: spacing.xl }}>
          <SuccessCheck size={64} />
          <Animated.View entering={FadeInUp.delay(120).duration(350)}>
            <AppText variant="headingL" style={{ marginTop: spacing.lg }}>
              Parking started
            </AppText>
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeIn.delay(280).duration(450)}
          style={{ alignItems: 'center', marginTop: spacing.xl }}
        >
          <ParkingSlip
            session={session}
            businessName={businessName}
            lotName={activeLot?.name}
          />
          <AppText variant="bodySmall" color="textFaint" style={{ marginTop: spacing.lg }}>
            {occupancy.available} of {occupancy.capacity} spaces free
          </AppText>
        </Animated.View>

        <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
          <Button title="Next vehicle" variant="secondary" onPress={reset} />
          <Button title="Done" variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

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
        <AppText variant="headingXL">Vehicle entry</AppText>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
        >
          <X size={24} color={colors.textMuted} />
        </Pressable>
      </View>
      {activeLot ? (
        <AppText variant="bodySmall" color="textFaint" style={{ marginTop: spacing.xs }}>
          {activeLot.name}
        </AppText>
      ) : null}

      <Animated.View entering={FadeInDown.duration(350)} style={{ marginTop: spacing.xxl }}>
        <PlateInput value={plate} onChange={setPlate} autoFocus />
      </Animated.View>

      <View style={{ marginTop: spacing.xxl }}>
        <AppText variant="label" color="textMuted" style={{ marginBottom: spacing.md }}>
          Vehicle type
        </AppText>
        <VehicleTypeSelector value={vehicleType} onChange={setVehicleType} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: spacing.xl,
          marginTop: spacing.xl,
          alignItems: 'center',
        }}
      >
        <Pressable
          onPress={() => setSlotSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Choose a slot"
          hitSlop={8}
        >
          <AppText variant="bodyMedium" color={selectedSlot ? 'accent' : 'textMuted'}>
            {selectedSlot ? `Slot ${selectedSlot.code}` : '+ Assign slot'}
          </AppText>
        </Pressable>
        {!showNotes ? (
          <Pressable
            onPress={() => setShowNotes(true)}
            accessibilityRole="button"
            accessibilityLabel="Add a note"
            hitSlop={8}
          >
            <AppText variant="bodyMedium" color="textMuted">
              + Add note
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {showNotes ? (
        <TextField
          value={notes}
          onChangeText={setNotes}
          placeholder="Helmet left with attendant…"
          containerStyle={{ marginTop: spacing.lg }}
          maxLength={300}
        />
      ) : null}

      <Button
        title="Start Parking"
        onPress={submit}
        disabled={!canSubmit}
        loading={entry.isPending}
        style={{ marginTop: spacing.xxxl }}
      />

      <Sheet
        visible={slotSheetOpen}
        onClose={() => setSlotSheetOpen(false)}
        title="Assign a slot"
      >
        {(slots.data ?? []).length === 0 ? (
          <AppText variant="body" color="textMuted" style={{ paddingBottom: spacing.xl }}>
            No free slots{activeLot ? ` at ${activeLot.name}` : ''}. The vehicle can park
            without a slot assignment.
          </AppText>
        ) : (
          (slots.data ?? [])
            .filter((slot) => !vehicleType || !slot.vehicleType || slot.vehicleType === vehicleType)
            .slice(0, 30)
            .map((slot, index, array) => (
              <ListRow
                key={slot._id}
                title={slot.code}
                subtitle={slot.vehicleType ?? 'Any vehicle'}
                divider={index < array.length - 1}
                onPress={() => {
                  setSelectedSlot(slot);
                  setSlotSheetOpen(false);
                }}
              />
            ))
        )}
        {selectedSlot ? (
          <Button
            title="Clear slot selection"
            variant="ghost"
            onPress={() => {
              setSelectedSlot(null);
              setSlotSheetOpen(false);
            }}
            style={{ marginTop: spacing.md }}
          />
        ) : null}
      </Sheet>
    </Screen>
  );
}
