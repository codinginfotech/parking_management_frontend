import { router } from '@/navigation/nav';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { PlateInput } from '@/components/parking/PlateInput';
import { VehicleTypeSelector } from '@/components/parking/VehicleTypeSelector';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { useCreatePass } from '@/features/passes/hooks';
import { apiErrorMessage } from '@/services/api';
import { spacing, useTheme } from '@/theme';
import { formatRupees } from '@/utils/currency';
import { todayKey } from '@/utils/datetime';
import { normalizePlate } from '@/utils/plate';
import type { VehicleType } from '@/types/models';

const MONTH_OPTIONS = [
  { value: '1', label: '1 month' },
  { value: '3', label: '3 months' },
  { value: '6', label: '6 months' },
  { value: '12', label: '12 months' },
];

export default function CreatePassScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const create = useCreatePass();

  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [holderName, setHolderName] = useState('');
  const [holderPhone, setHolderPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [months, setMonths] = useState('1');
  const [startDate, setStartDate] = useState(todayKey());

  const monthlyAmount = Number(amount) || 0;
  const totalMonths = Number(months);
  const canSubmit =
    normalizePlate(plate).length >= 4 &&
    vehicleType !== null &&
    holderName.trim().length >= 2 &&
    monthlyAmount > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(startDate);

  const submit = () => {
    if (!vehicleType) return;
    create.mutate(
      {
        vehicleNumber: normalizePlate(plate),
        vehicleType,
        holderName: holderName.trim(),
        holderPhone: holderPhone.trim() || undefined,
        amount: monthlyAmount,
        startDate,
        months: totalMonths,
      },
      {
        onSuccess: (pass) => {
          toast.show('success', 'Pass created', pass.displayNumber);
          router.back();
        },
        onError: (error) => toast.show('error', 'Could not create pass', apiErrorMessage(error)),
      }
    );
  };

  return (
    <Screen keyboardAvoiding>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingTop: spacing.lg }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12}>
          <ArrowLeft size={22} color={colors.textMuted} />
        </Pressable>
        <AppText variant="headingXL">New monthly pass</AppText>
      </View>

      <View style={{ marginTop: spacing.xxl, gap: spacing.xl }}>
        <PlateInput value={plate} onChange={setPlate} />
        <View>
          <AppText variant="label" color="textMuted" style={{ marginBottom: spacing.md }}>
            Vehicle type
          </AppText>
          <VehicleTypeSelector value={vehicleType} onChange={setVehicleType} />
        </View>
        <TextField
          label="Holder name"
          value={holderName}
          onChangeText={setHolderName}
          placeholder="Regular customer's name"
        />
        <TextField
          label="Mobile (optional)"
          value={holderPhone}
          onChangeText={setHolderPhone}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="98765 43210"
        />
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <TextField
            label="Monthly amount (â‚¹)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            placeholder="1500"
            containerStyle={{ flex: 1 }}
          />
          <TextField
            label="Start date"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            containerStyle={{ flex: 1 }}
          />
        </View>
        <View>
          <AppText variant="label" color="textMuted" style={{ marginBottom: spacing.md }}>
            Duration
          </AppText>
          <SegmentedControl options={MONTH_OPTIONS} value={months} onChange={setMonths} />
        </View>

        {monthlyAmount > 0 ? (
          <AppText variant="bodyMedium" color="textMuted">
            Total: {formatRupees(monthlyAmount * totalMonths)} for {totalMonths} month
            {totalMonths > 1 ? 's' : ''}
          </AppText>
        ) : null}

        <Button
          title="Create pass"
          onPress={submit}
          disabled={!canSubmit}
          loading={create.isPending}
        />
      </View>
    </Screen>
  );
}
