import { router } from '@/navigation/nav';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ColumnChart, HorizontalBars } from '@/components/analytics/Bars';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { AppText } from '@/components/ui/AppText';
import { Divider } from '@/components/ui/Divider';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Skeleton } from '@/components/ui/Skeleton';
import { VEHICLE_TYPE_LABELS } from '@/constants';
import { useActiveLot } from '@/features/dashboard/hooks';
import { useDailyReport, usePeakHours, useTrends } from '@/features/payments/hooks';
import { spacing, useTheme } from '@/theme';
import { formatRupees } from '@/utils/currency';
import { dateKeyDaysAgo, formatDuration, todayKey } from '@/utils/datetime';

type Period = 'today' | 'yesterday' | 'week';

export default function ReportsScreen() {
  const { colors } = useTheme();
  const { activeLot, lots } = useActiveLot();
  const [period, setPeriod] = useState<Period>('today');
  const [scope, setScope] = useState<'lot' | 'all'>('lot');

  const lotId = scope === 'lot' ? activeLot?._id : undefined;
  const reportDate =
    period === 'today' ? todayKey() : period === 'yesterday' ? dateKeyDaysAgo(1) : undefined;

  const daily = useDailyReport(reportDate, lotId);
  const trends = useTrends(7, lotId);
  const peak = usePeakHours(lotId);

  const showDaily = period !== 'week';
  const weekTotal = (trends.data ?? []).reduce((sum, day) => sum + day.revenue, 0);
  const weekSessions = (trends.data ?? []).reduce((sum, day) => sum + day.sessions, 0);

  return (
    <Screen>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingTop: spacing.lg }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12}>
          <ArrowLeft size={22} color={colors.textMuted} />
        </Pressable>
        <AppText variant="headingXL">Reports</AppText>
      </View>

      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        <SegmentedControl
          options={[
            { value: 'today', label: 'Today' },
            { value: 'yesterday', label: 'Yesterday' },
            { value: 'week', label: 'Last 7 days' },
          ]}
          value={period}
          onChange={setPeriod}
        />
        {lots.length > 1 ? (
          <SegmentedControl
            options={[
              { value: 'lot', label: activeLot?.name ?? 'This lot' },
              { value: 'all', label: 'All locations' },
            ]}
            value={scope}
            onChange={setScope}
          />
        ) : null}
      </View>

      {showDaily ? (
        daily.isLoading ? (
          <View style={{ gap: spacing.lg, marginTop: spacing.xxl }}>
            <Skeleton width={200} height={48} />
            <Skeleton height={120} />
          </View>
        ) : daily.data ? (
          <View style={{ marginTop: spacing.xxl }}>
            <AppText variant="label" color="textMuted">
              Collection
            </AppText>
            <AnimatedNumber
              value={daily.data.revenue}
              format="inr"
              prefix="₹"
              style={{ fontSize: 44, lineHeight: 52, marginTop: spacing.xs }}
            />

            <View style={{ flexDirection: 'row', marginTop: spacing.xl }}>
              <View style={{ flex: 1 }}>
                <AppText variant="label" color="textMuted">
                  Vehicles served
                </AppText>
                <AppText variant="numericL" style={{ marginTop: spacing.xs }}>
                  {daily.data.vehiclesEntered}
                </AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="label" color="textMuted">
                  Avg. duration
                </AppText>
                <AppText variant="numericL" style={{ marginTop: spacing.xs }}>
                  {formatDuration(daily.data.avgDurationMinutes)}
                </AppText>
              </View>
            </View>

            <Divider style={{ marginVertical: spacing.xxl }} />

            {daily.data.methodBreakdown.length > 0 ? (
              <>
                <AppText variant="label" color="textMuted" style={{ marginBottom: spacing.lg }}>
                  By payment method
                </AppText>
                <HorizontalBars
                  data={daily.data.methodBreakdown.map((entry) => ({
                    label: entry.method,
                    value: entry.total,
                    display: formatRupees(entry.total),
                  }))}
                />
              </>
            ) : null}

            {daily.data.vehicleTypeBreakdown.length > 0 ? (
              <>
                <AppText
                  variant="label"
                  color="textMuted"
                  style={{ marginTop: spacing.xxl, marginBottom: spacing.lg }}
                >
                  By vehicle type
                </AppText>
                <HorizontalBars
                  data={daily.data.vehicleTypeBreakdown.map((entry) => ({
                    label: VEHICLE_TYPE_LABELS[entry.vehicleType],
                    value: entry.count,
                    display: `${entry.count} · ${formatRupees(entry.revenue)}`,
                  }))}
                />
              </>
            ) : null}

            {daily.data.staffCollections.length > 0 ? (
              <>
                <AppText
                  variant="label"
                  color="textMuted"
                  style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}
                >
                  Staff collections
                </AppText>
                {daily.data.staffCollections.map((entry, index, array) => (
                  <View key={entry.staffId}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingVertical: spacing.md,
                      }}
                    >
                      <AppText variant="body">{entry.name}</AppText>
                      <AppText variant="numeric">{formatRupees(entry.total)}</AppText>
                    </View>
                    {index < array.length - 1 ? <Divider /> : null}
                  </View>
                ))}
              </>
            ) : null}
          </View>
        ) : null
      ) : (
        <View style={{ marginTop: spacing.xxl }}>
          <AppText variant="label" color="textMuted">
            7-day collection
          </AppText>
          <AnimatedNumber
            value={weekTotal}
            format="inr"
            prefix="₹"
            style={{ fontSize: 44, lineHeight: 52, marginTop: spacing.xs }}
          />
          <AppText variant="bodySmall" color="textFaint" style={{ marginTop: 2 }}>
            {weekSessions} vehicles served
          </AppText>

          <View style={{ marginTop: spacing.xxl }}>
            <AppText variant="label" color="textMuted" style={{ marginBottom: spacing.lg }}>
              Revenue by day
            </AppText>
            {trends.isLoading ? (
              <Skeleton height={120} />
            ) : (
              <ColumnChart
                data={(trends.data ?? []).map((day) => ({
                  label: day.date.slice(5),
                  value: day.revenue,
                }))}
              />
            )}
          </View>
        </View>
      )}

      <View style={{ marginTop: spacing.xxl, marginBottom: spacing.xl }}>
        <AppText variant="label" color="textMuted" style={{ marginBottom: spacing.lg }}>
          Peak hours · last 30 days
        </AppText>
        {peak.isLoading ? (
          <Skeleton height={100} />
        ) : (
          <ColumnChart
            height={100}
            data={(peak.data ?? []).map((entry) => ({
              label: `${entry.hour}:00`,
              value: entry.entries,
            }))}
          />
        )}
      </View>
    </Screen>
  );
}
