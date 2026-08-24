import { router } from '@/navigation/nav';
import { ArrowLeft, MapPin, Plus } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLots } from '@/features/dashboard/hooks';
import { useAuthStore } from '@/store/auth.store';
import { spacing, useTheme } from '@/theme';

export default function LotsScreen() {
  const { colors } = useTheme();
  const lots = useLots();
  const user = useAuthStore((state) => state.user);
  const canCreate = user?.role === 'OWNER' || user?.role === 'ADMIN';

  return (
    <Screen refreshing={lots.isRefetching} onRefresh={() => void lots.refetch()}>
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
          <AppText variant="headingXL">Parking lots</AppText>
        </View>
        {canCreate ? (
          <Pressable
            onPress={() => router.push('/(app)/lots/create')}
            accessibilityRole="button"
            accessibilityLabel="Create parking lot"
            hitSlop={12}
          >
            <Plus size={24} color={colors.accent} />
          </Pressable>
        ) : null}
      </View>

      <View style={{ marginTop: spacing.xl }}>
        {lots.isLoading ? (
          <View style={{ gap: spacing.lg }}>
            {[0, 1].map((index) => (
              <Skeleton key={index} height={64} />
            ))}
          </View>
        ) : (lots.data ?? []).length === 0 ? (
          <EmptyState
            icon={<MapPin size={26} color={colors.textMuted} strokeWidth={1.6} />}
            title="No lots yet"
            message="Create your first parking location to start operations."
            actionTitle={canCreate ? 'Create parking lot' : undefined}
            onAction={() => router.push('/(app)/lots/create')}
          />
        ) : (
          (lots.data ?? []).map((lot) => (
            <ListRow
              key={lot._id}
              title={lot.name}
              subtitle={lot.address ?? 'No address'}
              chevron
              right={
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText variant="numeric">
                    {lot.occupied ?? 0}/{lot.totalCapacity}
                  </AppText>
                  <AppText variant="bodySmall" color={lot.isActive ? 'success' : 'textFaint'}>
                    {lot.isActive ? 'Live' : 'Inactive'}
                  </AppText>
                </View>
              }
              onPress={() =>
                router.push({ pathname: '/(app)/lots/[id]', params: { id: lot._id } })
              }
            />
          ))
        )}
      </View>
    </Screen>
  );
}
