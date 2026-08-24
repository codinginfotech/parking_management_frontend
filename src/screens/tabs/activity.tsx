import { Activity as ActivityIcon } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { ActivityRow } from '@/components/parking/ActivityRow';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Skeleton } from '@/components/ui/Skeleton';
import { useActiveLot } from '@/features/dashboard/hooks';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { activityService } from '@/services/parking.service';
import { spacing, useTheme } from '@/theme';

type Scope = 'lot' | 'all';

export default function ActivityScreen() {
  const { colors } = useTheme();
  const { activeLot, lots } = useActiveLot();
  const [scope, setScope] = useState<Scope>('lot');

  const lotId = scope === 'lot' ? activeLot?._id : undefined;
  const activity = useQuery({
    queryKey: queryKeys.activity({ lotId: lotId ?? 'all', limit: 50 }),
    queryFn: () => activityService.list({ lotId, limit: 50, page: 1 }),
    staleTime: 15000,
  });

  const scopeOptions = useMemo(
    () => [
      { value: 'lot' as Scope, label: activeLot?.name ?? 'This lot' },
      { value: 'all' as Scope, label: 'All locations' },
    ],
    [activeLot?.name]
  );

  const items = activity.data?.items ?? [];

  return (
    <Screen scroll={false}>
      <View style={{ paddingTop: spacing.xl }}>
        <AppText variant="headingXL">Activity</AppText>
        {lots.length > 1 ? (
          <View style={{ marginTop: spacing.lg }}>
            <SegmentedControl options={scopeOptions} value={scope} onChange={setScope} />
          </View>
        ) : null}
      </View>

      {activity.isLoading ? (
        <View style={{ gap: spacing.lg, paddingTop: spacing.xl }}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View key={index} style={{ flexDirection: 'row', gap: spacing.lg }}>
              <Skeleton width={34} height={34} round />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Skeleton width="80%" height={16} />
                <Skeleton width={120} height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ActivityIcon size={26} color={colors.textMuted} strokeWidth={1.6} />}
          title="No activity yet"
          message="Entries, exits, payments and shifts will appear here as they happen."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          refreshing={activity.isRefetching}
          onRefresh={() => void activity.refetch()}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xxl }}
          renderItem={({ item, index }) => (
            <ActivityRow item={item} divider={index < items.length - 1} />
          )}
        />
      )}
    </Screen>
  );
}
