import { router } from '@/navigation/nav';
import { CircleParking, Search } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SessionRow } from '@/components/parking/SessionRow';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Skeleton } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { VEHICLE_TYPE_OPTIONS } from '@/constants';
import { useActiveLot } from '@/features/dashboard/hooks';
import { useActiveSessions } from '@/features/parking/hooks';
import { spacing, useTheme } from '@/theme';
import type { VehicleType } from '@/types/models';

type Filter = VehicleType | 'ALL';

export default function ParkingScreen() {
  const { colors } = useTheme();
  const { activeLot } = useActiveLot();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const sessions = useActiveSessions({
    lotId: activeLot?._id,
    search: search.trim() || undefined,
    vehicleType: filter === 'ALL' ? undefined : filter,
    sort,
  });

  const filterOptions = useMemo(
    () => [
      { value: 'ALL' as Filter, label: 'All' },
      ...VEHICLE_TYPE_OPTIONS.map((option) => ({
        value: option.value as Filter,
        label: option.label,
      })),
    ],
    []
  );

  const items = sessions.data?.items ?? [];

  return (
    <Screen scroll={false}>
      <View style={{ paddingTop: spacing.xl }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <AppText variant="headingXL">Live parking</AppText>
          <AppText
            variant="bodyMedium"
            color="textMuted"
            onPress={() => setSort(sort === 'newest' ? 'oldest' : 'newest')}
            suppressHighlighting
            accessibilityRole="button"
          >
            {sort === 'newest' ? 'Newest first' : 'Longest first'}
          </AppText>
        </View>

        <TextField
          value={search}
          onChangeText={setSearch}
          placeholder="Search vehicle number"
          autoCapitalize="characters"
          autoCorrect={false}
          containerStyle={{ marginTop: spacing.lg }}
          right={<Search size={18} color={colors.textFaint} />}
        />

        <View style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
          <SegmentedControl
            options={filterOptions}
            value={filter}
            onChange={setFilter}
            scrollable
          />
        </View>
      </View>

      {sessions.isLoading ? (
        <View style={{ gap: spacing.lg, paddingTop: spacing.lg }}>
          {[0, 1, 2, 3, 4].map((index) => (
            <View key={index} style={{ gap: spacing.sm }}>
              <Skeleton width={170} height={20} />
              <Skeleton width={110} height={14} />
            </View>
          ))}
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CircleParking size={26} color={colors.textMuted} strokeWidth={1.6} />}
          title={search || filter !== 'ALL' ? 'No matches' : 'All clear.'}
          message={
            search || filter !== 'ALL'
              ? 'No parked vehicle matches this search.'
              : 'No vehicles are parked right now.'
          }
          actionTitle={search || filter !== 'ALL' ? undefined : 'Start a vehicle entry'}
          onAction={() => router.push('/(app)/entry')}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          refreshing={sessions.isRefetching}
          onRefresh={() => void sessions.refetch()}
          ListHeaderComponent={
            <AppText variant="bodySmall" color="textFaint" style={{ paddingVertical: spacing.sm }}>
              {sessions.data?.total ?? 0} vehicle{(sessions.data?.total ?? 0) === 1 ? '' : 's'} inside
            </AppText>
          }
          renderItem={({ item }) => (
            <SessionRow
              session={item}
              showLot={!activeLot}
              onPress={() =>
                router.push({ pathname: '/(app)/exit', params: { sessionId: item._id } })
              }
            />
          )}
        />
      )}
    </Screen>
  );
}
