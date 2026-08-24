import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { VEHICLE_TYPE_OPTIONS } from '@/constants';
import { CreateLotPayload } from '@/services/parking.service';
import { spacing, useTheme } from '@/theme';
import type { ParkingLot, PricingMode, PricingRule, VehicleType } from '@/types/models';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Divider } from '../ui/Divider';
import { SegmentedControl } from '../ui/SegmentedControl';
import { TextField } from '../ui/TextField';

interface TypeConfig {
  enabled: boolean;
  spaces: string;
  mode: PricingMode;
  flatRate: string;
  firstHourRate: string;
  additionalHourRate: string;
  slabs: { hours: string; amount: string }[];
  dailyMax: string;
}

type FormState = {
  name: string;
  address: string;
  types: Record<VehicleType, TypeConfig>;
};

const EMPTY_TYPE: TypeConfig = {
  enabled: false,
  spaces: '',
  mode: 'FLAT',
  flatRate: '',
  firstHourRate: '',
  additionalHourRate: '',
  slabs: [{ hours: '1', amount: '' }],
  dailyMax: '',
};

function configFromLot(lot: ParkingLot): FormState {
  const types = {} as Record<VehicleType, TypeConfig>;
  for (const option of VEHICLE_TYPE_OPTIONS) {
    const capacity = lot.capacity.find((entry) => entry.vehicleType === option.value);
    const rule = lot.pricing.find((entry) => entry.vehicleType === option.value);
    types[option.value] = {
      enabled: Boolean(capacity),
      spaces: capacity ? String(capacity.spaces) : '',
      mode: rule?.mode ?? 'FLAT',
      flatRate: rule?.flatRate !== undefined ? String(rule.flatRate) : '',
      firstHourRate: rule?.firstHourRate !== undefined ? String(rule.firstHourRate) : '',
      additionalHourRate:
        rule?.additionalHourRate !== undefined ? String(rule.additionalHourRate) : '',
      slabs:
        rule?.slabs && rule.slabs.length > 0
          ? rule.slabs.map((slab) => ({
              hours: String(slab.uptoMinutes / 60),
              amount: String(slab.amount),
            }))
          : [{ hours: '1', amount: '' }],
      dailyMax: rule?.dailyMax !== undefined ? String(rule.dailyMax) : '',
    };
  }
  return { name: lot.name, address: lot.address ?? '', types };
}

function emptyForm(): FormState {
  const types = {} as Record<VehicleType, TypeConfig>;
  for (const option of VEHICLE_TYPE_OPTIONS) {
    types[option.value] = { ...EMPTY_TYPE, slabs: [{ hours: '1', amount: '' }] };
  }
  return { name: '', address: '', types };
}

const MODE_OPTIONS: { value: PricingMode; label: string }[] = [
  { value: 'FLAT', label: 'Flat' },
  { value: 'HOURLY', label: 'Hourly' },
  { value: 'SLAB', label: 'Slabs' },
];

interface LotFormProps {
  initial?: ParkingLot;
  submitting: boolean;
  onSubmit: (payload: CreateLotPayload) => void;
}

export function LotForm({ initial, submitting, onSubmit }: LotFormProps) {
  const { colors } = useTheme();
  const [form, setForm] = useState<FormState>(() =>
    initial ? configFromLot(initial) : emptyForm()
  );
  const [error, setError] = useState<string | null>(null);

  const updateType = (type: VehicleType, patch: Partial<TypeConfig>) =>
    setForm((current) => ({
      ...current,
      types: { ...current.types, [type]: { ...current.types[type], ...patch } },
    }));

  const submit = () => {
    setError(null);
    if (form.name.trim().length < 2) {
      setError('Enter a lot name');
      return;
    }
    const capacity: CreateLotPayload['capacity'] = [];
    const pricing: PricingRule[] = [];

    for (const option of VEHICLE_TYPE_OPTIONS) {
      const config = form.types[option.value];
      if (!config.enabled) continue;
      const spaces = Number(config.spaces);
      if (!Number.isInteger(spaces) || spaces < 1) {
        setError(`Enter the number of ${option.label} spaces`);
        return;
      }
      capacity.push({ vehicleType: option.value, spaces });

      const rule: PricingRule = { vehicleType: option.value, mode: config.mode };
      if (config.dailyMax) rule.dailyMax = Number(config.dailyMax);

      if (config.mode === 'FLAT') {
        if (config.flatRate === '' || Number(config.flatRate) < 0) {
          setError(`Enter the flat rate for ${option.label}`);
          return;
        }
        rule.flatRate = Number(config.flatRate);
      } else if (config.mode === 'HOURLY') {
        if (config.firstHourRate === '' || config.additionalHourRate === '') {
          setError(`Enter hourly rates for ${option.label}`);
          return;
        }
        rule.firstHourRate = Number(config.firstHourRate);
        rule.additionalHourRate = Number(config.additionalHourRate);
      } else {
        const slabs = config.slabs
          .filter((slab) => slab.hours !== '' && slab.amount !== '')
          .map((slab) => ({
            uptoMinutes: Math.round(Number(slab.hours) * 60),
            amount: Number(slab.amount),
          }))
          .filter((slab) => slab.uptoMinutes > 0 && slab.amount >= 0);
        if (slabs.length === 0) {
          setError(`Add at least one slab for ${option.label}`);
          return;
        }
        rule.slabs = slabs.sort((a, b) => a.uptoMinutes - b.uptoMinutes);
      }
      pricing.push(rule);
    }

    if (capacity.length === 0) {
      setError('Enable at least one vehicle type');
      return;
    }

    onSubmit({
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      capacity,
      pricing,
      operatingHours: { is24Hours: true },
    });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <TextField
        label="Lot name"
        value={form.name}
        onChangeText={(name) => setForm((current) => ({ ...current, name }))}
        placeholder="Central Parking"
      />
      <TextField
        label="Address"
        value={form.address}
        onChangeText={(address) => setForm((current) => ({ ...current, address }))}
        placeholder="MG Road, Indore"
      />

      <AppText variant="label" color="textMuted" style={{ marginTop: spacing.md }}>
        Capacity & pricing
      </AppText>

      {VEHICLE_TYPE_OPTIONS.map((option) => {
        const config = form.types[option.value];
        return (
          <View key={option.value}>
            <Pressable
              onPress={() => updateType(option.value, { enabled: !config.enabled })}
              accessibilityRole="switch"
              accessibilityState={{ checked: config.enabled }}
              accessibilityLabel={`${option.label} parking`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.md,
              }}
            >
              <AppText variant="headingM">{option.label}</AppText>
              <AppText variant="bodyMedium" color={config.enabled ? 'accent' : 'textFaint'}>
                {config.enabled ? 'Enabled' : 'Off'}
              </AppText>
            </Pressable>

            {config.enabled ? (
              <View style={{ gap: spacing.md, paddingBottom: spacing.lg }}>
                <TextField
                  label="Spaces"
                  value={config.spaces}
                  onChangeText={(spaces) => updateType(option.value, { spaces })}
                  keyboardType="number-pad"
                  placeholder="40"
                />
                <SegmentedControl
                  options={MODE_OPTIONS}
                  value={config.mode}
                  onChange={(mode) => updateType(option.value, { mode })}
                />
                {config.mode === 'FLAT' ? (
                  <TextField
                    label="Flat rate (₹ per stay)"
                    value={config.flatRate}
                    onChangeText={(flatRate) => updateType(option.value, { flatRate })}
                    keyboardType="number-pad"
                    placeholder="50"
                  />
                ) : null}
                {config.mode === 'HOURLY' ? (
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <TextField
                      label="First hour (₹)"
                      value={config.firstHourRate}
                      onChangeText={(firstHourRate) =>
                        updateType(option.value, { firstHourRate })
                      }
                      keyboardType="number-pad"
                      placeholder="30"
                      containerStyle={{ flex: 1 }}
                    />
                    <TextField
                      label="Each next hour (₹)"
                      value={config.additionalHourRate}
                      onChangeText={(additionalHourRate) =>
                        updateType(option.value, { additionalHourRate })
                      }
                      keyboardType="number-pad"
                      placeholder="20"
                      containerStyle={{ flex: 1 }}
                    />
                  </View>
                ) : null}
                {config.mode === 'SLAB' ? (
                  <View style={{ gap: spacing.sm }}>
                    {config.slabs.map((slab, index) => (
                      <View key={index} style={{ flexDirection: 'row', gap: spacing.md }}>
                        <TextField
                          label={index === 0 ? 'Up to (hours)' : undefined}
                          value={slab.hours}
                          onChangeText={(hours) => {
                            const slabs = [...config.slabs];
                            slabs[index] = { ...(slabs[index] as typeof slab), hours };
                            updateType(option.value, { slabs });
                          }}
                          keyboardType="decimal-pad"
                          placeholder="1"
                          containerStyle={{ flex: 1 }}
                        />
                        <TextField
                          label={index === 0 ? 'Charge (₹)' : undefined}
                          value={slab.amount}
                          onChangeText={(amount) => {
                            const slabs = [...config.slabs];
                            slabs[index] = { ...(slabs[index] as typeof slab), amount };
                            updateType(option.value, { slabs });
                          }}
                          keyboardType="number-pad"
                          placeholder="30"
                          containerStyle={{ flex: 1 }}
                        />
                      </View>
                    ))}
                    <Pressable
                      onPress={() =>
                        updateType(option.value, {
                          slabs: [...config.slabs, { hours: '', amount: '' }],
                        })
                      }
                      accessibilityRole="button"
                      hitSlop={8}
                    >
                      <AppText variant="bodyMedium" color="accent">
                        + Add slab
                      </AppText>
                    </Pressable>
                  </View>
                ) : null}
                <TextField
                  label="Daily maximum (₹, optional)"
                  value={config.dailyMax}
                  onChangeText={(dailyMax) => updateType(option.value, { dailyMax })}
                  keyboardType="number-pad"
                  placeholder="300"
                />
              </View>
            ) : null}
            <Divider />
          </View>
        );
      })}

      {error ? (
        <AppText variant="bodySmall" color={colors.danger}>
          {error}
        </AppText>
      ) : null}

      <Button
        title={initial ? 'Save changes' : 'Create parking lot'}
        onPress={submit}
        loading={submitting}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );
}
