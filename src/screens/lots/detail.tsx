import { router, useLocalSearchParams } from '@/navigation/nav';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LotForm } from '@/components/parking/LotForm';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { VEHICLE_TYPE_LABELS } from '@/constants';
import { queryKeys } from '@/constants/query-keys';
import { useLotDetail } from '@/features/dashboard/hooks';
import { apiErrorMessage } from '@/services/api';
import { CreateLotPayload, lotsService, slotsService } from '@/services/parking.service';
import { useAuthStore } from '@/store/auth.store';
import { spacing, useTheme } from '@/theme';
import type { PricingRule } from '@/types/models';

function pricingSummary(rule: PricingRule): string {
  if (rule.mode === 'FLAT') return `₹${rule.flatRate} flat`;
  if (rule.mode === 'HOURLY')
    return `₹${rule.firstHourRate} first hr · ₹${rule.additionalHourRate}/hr after`;
  const slabs = (rule.slabs ?? [])
    .map((slab) => `${slab.uptoMinutes / 60}h → ₹${slab.amount}`)
    .join(' · ');
  return slabs || 'Slab pricing';
}

type Section = 'overview' | 'slots' | 'edit';

export default function LotDetailScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const lot = useLotDetail(id);

  const [section, setSection] = useState<Section>('overview');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState({ prefix: 'A', from: '1', to: '10' });

  const slots = useQuery({
    queryKey: queryKeys.slots(id ?? 'none'),
    queryFn: () => slotsService.list(id as string),
    enabled: Boolean(id) && section === 'slots',
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['lots'] });
    void queryClient.invalidateQueries({ queryKey: ['slots'] });
  };

  const update = useMutation({
    mutationFn: (payload: Partial<CreateLotPayload>) =>
      lotsService.update(id as string, payload),
    onSuccess: () => {
      invalidate();
      toast.show('success', 'Lot updated');
      setSection('overview');
    },
    onError: (error) => toast.show('error', 'Update failed', apiErrorMessage(error)),
  });

  const bulkCreate = useMutation({
    mutationFn: () =>
      slotsService.createBulk({
        lotId: id as string,
        prefix: bulk.prefix.trim(),
        from: Number(bulk.from),
        to: Number(bulk.to),
      }),
    onSuccess: (result) => {
      invalidate();
      setBulkOpen(false);
      toast.show('success', `${result.created} slots added`);
    },
    onError: (error) => toast.show('error', 'Could not add slots', apiErrorMessage(error)),
  });

  const toggleSlot = useMutation({
    mutationFn: ({ slotId, status }: { slotId: string; status: 'AVAILABLE' | 'BLOCKED' }) =>
      slotsService.update(slotId, { status }),
    onSuccess: invalidate,
    onError: (error) => toast.show('error', 'Could not update slot', apiErrorMessage(error)),
  });

  const canEdit = user?.role === 'OWNER' || user?.role === 'ADMIN';
  const sections: { value: Section; label: string }[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'slots', label: 'Slots' },
    ...(canEdit ? [{ value: 'edit' as Section, label: 'Edit' }] : []),
  ];

  return (
    <Screen keyboardAvoiding={section === 'edit'}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingTop: spacing.lg }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12}>
          <ArrowLeft size={22} color={colors.textMuted} />
        </Pressable>
        <AppText variant="headingXL" numberOfLines={1} style={{ flex: 1 }}>
          {lot.data?.name ?? 'Parking lot'}
        </AppText>
      </View>

      {lot.isLoading ? (
        <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
          <Skeleton height={44} />
          <Skeleton height={120} />
        </View>
      ) : lot.data ? (
        <>
          <View style={{ marginVertical: spacing.xl }}>
            <SegmentedControl options={sections} value={section} onChange={setSection} />
          </View>

          {section === 'overview' ? (
            <View>
              <AppText variant="bodySmall" color="textMuted">
                {lot.data.address ?? 'No address on file'}
              </AppText>

              <View style={{ marginTop: spacing.xl }}>
                <AppText variant="label" color="textMuted">
                  Live occupancy
                </AppText>
                {(lot.data.occupancy?.byType ?? []).map((entry, index, array) => (
                  <View key={entry.vehicleType}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: spacing.md,
                      }}
                    >
                      <AppText variant="bodyMedium">
                        {VEHICLE_TYPE_LABELS[entry.vehicleType]}
                      </AppText>
                      <AppText variant="numeric" color={entry.occupied >= entry.capacity ? 'danger' : 'text'}>
                        {entry.occupied}/{entry.capacity}
                      </AppText>
                    </View>
                    {index < array.length - 1 ? <Divider /> : null}
                  </View>
                ))}
              </View>

              <View style={{ marginTop: spacing.xxl }}>
                <AppText variant="label" color="textMuted">
                  Pricing
                </AppText>
                {lot.data.pricing.map((rule, index, array) => (
                  <View key={rule.vehicleType}>
                    <View style={{ paddingVertical: spacing.md }}>
                      <AppText variant="bodyMedium">
                        {VEHICLE_TYPE_LABELS[rule.vehicleType]}
                      </AppText>
                      <AppText variant="bodySmall" color="textMuted" style={{ marginTop: 2 }}>
                        {pricingSummary(rule)}
                        {rule.dailyMax ? ` · max ₹${rule.dailyMax}/day` : ''}
                      </AppText>
                    </View>
                    {index < array.length - 1 ? <Divider /> : null}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {section === 'slots' ? (
            <View>
              <Button
                title="Add slots in bulk"
                variant="secondary"
                size="md"
                onPress={() => setBulkOpen(true)}
              />
              <View style={{ marginTop: spacing.lg }}>
                {(slots.data ?? []).map((slot, index, array) => (
                  <ListRow
                    key={slot._id}
                    title={slot.code}
                    subtitle={
                      slot.status === 'OCCUPIED' && slot.activeSession
                        ? `Occupied · ${slot.activeSession.vehicleNumber}`
                        : slot.status === 'BLOCKED'
                          ? 'Blocked'
                          : 'Available'
                    }
                    divider={index < array.length - 1}
                    right={
                      slot.status !== 'OCCUPIED' ? (
                        <AppText
                          variant="bodyMedium"
                          color={slot.status === 'BLOCKED' ? 'success' : 'warning'}
                          onPress={() =>
                            toggleSlot.mutate({
                              slotId: slot._id,
                              status: slot.status === 'BLOCKED' ? 'AVAILABLE' : 'BLOCKED',
                            })
                          }
                          suppressHighlighting
                        >
                          {slot.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                        </AppText>
                      ) : undefined
                    }
                  />
                ))}
                {slots.data && slots.data.length === 0 ? (
                  <AppText variant="body" color="textFaint" style={{ paddingVertical: spacing.xl }}>
                    No slots defined. Slots are optional — add them if you assign
                    numbered spaces.
                  </AppText>
                ) : null}
              </View>
            </View>
          ) : null}

          {section === 'edit' && canEdit ? (
            <LotForm
              initial={lot.data}
              submitting={update.isPending}
              onSubmit={(payload) => update.mutate(payload)}
            />
          ) : null}
        </>
      ) : null}

      <Sheet visible={bulkOpen} onClose={() => setBulkOpen(false)} title="Add slots">
        <View style={{ gap: spacing.lg }}>
          <TextField
            label="Prefix"
            value={bulk.prefix}
            onChangeText={(prefix) => setBulk((current) => ({ ...current, prefix }))}
            autoCapitalize="characters"
            maxLength={4}
            placeholder="A"
          />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TextField
              label="From"
              value={bulk.from}
              onChangeText={(from) => setBulk((current) => ({ ...current, from }))}
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
            />
            <TextField
              label="To"
              value={bulk.to}
              onChangeText={(to) => setBulk((current) => ({ ...current, to }))}
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
            />
          </View>
          <AppText variant="bodySmall" color="textFaint">
            Creates {bulk.prefix.toUpperCase()}-{bulk.from} … {bulk.prefix.toUpperCase()}-{bulk.to}
          </AppText>
          <Button
            title="Create slots"
            onPress={() => bulkCreate.mutate()}
            loading={bulkCreate.isPending}
          />
        </View>
      </Sheet>
    </Screen>
  );
}
