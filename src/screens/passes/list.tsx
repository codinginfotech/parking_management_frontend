import { router } from '@/navigation/nav';
import { ArrowLeft, Plus, Ticket } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useCancelPass, usePasses, useRenewPass } from '@/features/passes/hooks';
import { apiErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { spacing, useTheme } from '@/theme';
import { formatRupees } from '@/utils/currency';
import { formatDate } from '@/utils/datetime';
import type { MonthlyPass } from '@/types/models';

type Filter = 'ACTIVE' | 'EXPIRED' | 'ALL';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'textFaint' | 'danger'> = {
  ACTIVE: 'success',
  UPCOMING: 'warning',
  EXPIRED: 'textFaint',
  CANCELLED: 'danger',
};

export default function PassesScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState<Filter>('ACTIVE');
  const [selected, setSelected] = useState<MonthlyPass | null>(null);

  const passes = usePasses({ status: filter === 'ALL' ? undefined : filter });
  const renew = useRenewPass();
  const cancel = useCancelPass();

  const canManage = user?.role !== 'ATTENDANT';
  const items = passes.data?.items ?? [];

  const doRenew = (months: number) => {
    if (!selected) return;
    renew.mutate(
      { id: selected._id, months, amount: selected.amount * months },
      {
        onSuccess: () => {
          toast.show('success', `Pass renewed for ${months} month${months > 1 ? 's' : ''}`);
          setSelected(null);
        },
        onError: (error) => toast.show('error', 'Renewal failed', apiErrorMessage(error)),
      }
    );
  };

  return (
    <Screen refreshing={passes.isRefetching} onRefresh={() => void passes.refetch()}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12}>
            <ArrowLeft size={22} color={colors.textMuted} />
          </Pressable>
          <AppText variant="headingXL">Monthly passes</AppText>
        </View>
        {canManage ? (
          <Pressable
            onPress={() => router.push('/(app)/passes/create')}
            accessibilityRole="button"
            accessibilityLabel="Create pass"
            hitSlop={12}
          >
            <Plus size={24} color={colors.accent} />
          </Pressable>
        ) : null}
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <SegmentedControl
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'EXPIRED', label: 'Expired' },
            { value: 'ALL', label: 'All' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </View>

      <View style={{ marginTop: spacing.lg }}>
        {passes.isLoading ? (
          <View style={{ gap: spacing.lg }}>
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} height={60} />
            ))}
          </View>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Ticket size={26} color={colors.textMuted} strokeWidth={1.6} />}
            title="No passes here"
            message="Monthly passes let regulars drive in without per-visit payment."
            actionTitle={canManage ? 'Create a pass' : undefined}
            onAction={() => router.push('/(app)/passes/create')}
          />
        ) : (
          items.map((pass, index) => (
            <ListRow
              key={pass._id}
              title={pass.displayNumber}
              subtitle={`${pass.holderName} Â· ${formatRupees(pass.amount)}/month`}
              divider={index < items.length - 1}
              right={
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText variant="bodySmall" color={STATUS_COLOR[pass.effectiveStatus] ?? 'textMuted'}>
                    {pass.effectiveStatus}
                  </AppText>
                  <AppText variant="bodySmall" color="textFaint" style={{ marginTop: 2 }}>
                    till {formatDate(pass.endDate)}
                  </AppText>
                </View>
              }
              onPress={canManage ? () => setSelected(pass) : undefined}
            />
          ))
        )}
      </View>

      <Sheet
        visible={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.displayNumber}
      >
        {selected ? (
          <View style={{ gap: spacing.sm }}>
            <AppText variant="body" color="textMuted" style={{ marginBottom: spacing.md }}>
              {selected.holderName} Â· valid {formatDate(selected.startDate)} â€“{' '}
              {formatDate(selected.endDate)}
            </AppText>
            <Button
              title={`Renew 1 month Â· ${formatRupees(selected.amount)}`}
              onPress={() => doRenew(1)}
              loading={renew.isPending}
            />
            <Button
              title={`Renew 3 months Â· ${formatRupees(selected.amount * 3)}`}
              variant="secondary"
              onPress={() => doRenew(3)}
            />
            {selected.status !== 'CANCELLED' ? (
              <Button
                title="Cancel pass"
                variant="ghost"
                onPress={() =>
                  cancel.mutate(selected._id, {
                    onSuccess: () => {
                      toast.show('success', 'Pass cancelled');
                      setSelected(null);
                    },
                    onError: (error) =>
                      toast.show('error', 'Could not cancel', apiErrorMessage(error)),
                  })
                }
              />
            ) : null}
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}
