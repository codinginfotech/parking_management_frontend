import { router } from '@/navigation/nav';
import { ChevronDown, LogIn, LogOut } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ActivityRow } from '@/components/parking/ActivityRow';
import { OccupancyRing } from '@/components/parking/OccupancyRing';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { ListRow } from '@/components/ui/ListRow';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useActiveLot,
  useOverview,
  useRecentActivity,
} from '@/features/dashboard/hooks';
import { useAuthStore } from '@/store/auth.store';
import { spacing, useTheme } from '@/theme';
import { greetingForNow } from '@/utils/datetime';

function HomeSkeleton() {
  return (
    <View style={{ gap: spacing.xl, paddingTop: spacing.xl }}>
      <Skeleton width={180} height={34} />
      <Skeleton width={130} height={18} />
      <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
        <Skeleton width={250} height={250} round />
      </View>
      <Skeleton width={160} height={40} />
      <Skeleton height={54} />
    </View>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const { lots, activeLot, setActiveLot } = useActiveLot();
  const lotId = activeLot?._id;
  const overview = useOverview(lotId);
  const activity = useRecentActivity(lotId);
  const [lotPickerOpen, setLotPickerOpen] = useState(false);

  const firstName = user?.fullName.split(' ')[0] ?? '';
  const loading = overview.isLoading || (!activeLot && lots.length === 0 && overview.isPending);

  return (
    <Screen
      refreshing={overview.isRefetching}
      onRefresh={() => {
        void overview.refetch();
        void activity.refetch();
      }}
    >
      {loading ? (
        <HomeSkeleton />
      ) : (
        <View style={{ paddingTop: spacing.xl }}>
          <Animated.View entering={FadeInDown.duration(350)}>
            <AppText variant="headingXL">
              {greetingForNow()},{'\n'}
              {firstName}.
            </AppText>

            {activeLot ? (
              <PressableScale
                onPress={() => lots.length > 1 && setLotPickerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`Current lot: ${activeLot.name}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  marginTop: spacing.lg,
                  alignSelf: 'flex-start',
                }}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: colors.success,
                  }}
                />
                <AppText variant="bodyMedium" color="textMuted">
                  {activeLot.name} Â· Live
                </AppText>
                {lots.length > 1 ? (
                  <ChevronDown size={15} color={colors.textFaint} />
                ) : null}
              </PressableScale>
            ) : null}
          </Animated.View>

          {activeLot ? (
            <Animated.View
              entering={FadeIn.delay(120).duration(450)}
              style={{ alignItems: 'center', paddingVertical: spacing.xxl }}
            >
              <OccupancyRing
                occupied={activeLot.occupied ?? 0}
                capacity={activeLot.totalCapacity}
              >
                <AnimatedNumber
                  value={activeLot.occupied ?? 0}
                  variant="heroNumber"
                  duration={900}
                />
                <AppText variant="body" color="textMuted" style={{ marginTop: -6 }}>
                  vehicles inside
                </AppText>
                <AppText variant="bodySmall" color="textFaint" style={{ marginTop: spacing.sm }}>
                  {activeLot.available ?? activeLot.totalCapacity} available Â·{' '}
                  {activeLot.totalCapacity} total
                </AppText>
              </OccupancyRing>
            </Animated.View>
          ) : (
            <View style={{ paddingVertical: spacing.xxl }}>
              <AppText variant="headingL">No parking lot yet.</AppText>
              <AppText variant="body" color="textMuted" style={{ marginTop: spacing.sm }}>
                Create your first lot to start running operations.
              </AppText>
              <Button
                title="Create parking lot"
                onPress={() => router.push('/(app)/lots/create')}
                style={{ marginTop: spacing.xl }}
              />
            </View>
          )}

          {activeLot ? (
            <>
              <Divider />
              <View style={{ paddingVertical: spacing.xl }}>
                <AppText variant="label" color="textMuted">
                  Today's collection
                </AppText>
                <AnimatedNumber
                  value={overview.data?.todayRevenue ?? 0}
                  format="inr"
                  prefix="â‚¹"
                  variant="numericL"
                  style={{ fontSize: 36, lineHeight: 44, marginTop: spacing.xs }}
                />
                <AppText variant="bodySmall" color="textFaint" style={{ marginTop: 2 }}>
                  {overview.data?.vehiclesServedToday ?? 0} vehicles served today
                </AppText>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Button
                  title="Vehicle Entry"
                  onPress={() => router.push('/(app)/entry')}
                  icon={<LogIn size={18} color={colors.onAccent} strokeWidth={2.2} />}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Exit"
                  variant="secondary"
                  onPress={() => router.push('/(app)/exit')}
                  icon={<LogOut size={18} color={colors.text} strokeWidth={2} />}
                  style={{ flex: 1 }}
                />
              </View>

              <View style={{ marginTop: spacing.xxl }}>
                <AppText variant="label" color="textMuted" style={{ marginBottom: spacing.sm }}>
                  Recent activity
                </AppText>
                {activity.data?.items.length === 0 ? (
                  <AppText variant="body" color="textFaint" style={{ paddingVertical: spacing.lg }}>
                    Nothing yet today. It stays quiet until the first vehicle rolls in.
                  </AppText>
                ) : (
                  activity.data?.items
                    .slice(0, 6)
                    .map((item, index, array) => (
                      <ActivityRow
                        key={item._id}
                        item={item}
                        divider={index < array.length - 1}
                      />
                    ))
                )}
              </View>
            </>
          ) : null}
        </View>
      )}

      <Sheet
        visible={lotPickerOpen}
        onClose={() => setLotPickerOpen(false)}
        title="Switch location"
      >
        {lots.map((lot, index) => (
          <ListRow
            key={lot._id}
            title={lot.name}
            subtitle={`${lot.occupied ?? 0}/${lot.totalCapacity} occupied`}
            divider={index < lots.length - 1}
            right={
              lot._id === activeLot?._id ? (
                <AppText variant="bodySmall" color="accent">
                  Current
                </AppText>
              ) : undefined
            }
            onPress={() => {
              setActiveLot(lot._id);
              setLotPickerOpen(false);
            }}
          />
        ))}
      </Sheet>
    </Screen>
  );
}
