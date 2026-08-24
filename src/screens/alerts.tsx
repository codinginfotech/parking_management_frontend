import { router } from '@/navigation/nav';
import { ArrowLeft, BellOff, Clock, MapPin, Ticket } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { useNotifications } from '@/features/dashboard/hooks';
import { spacing, useTheme } from '@/theme';

const TYPE_ICONS = {
  PASS_EXPIRING: Ticket,
  LOT_NEAR_CAPACITY: MapPin,
  LONG_OPEN_SHIFT: Clock,
} as const;

export default function AlertsScreen() {
  const { colors } = useTheme();
  const notifications = useNotifications();
  const items = notifications.data ?? [];

  return (
    <Screen
      refreshing={notifications.isRefetching}
      onRefresh={() => void notifications.refetch()}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingTop: spacing.lg }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12}>
          <ArrowLeft size={22} color={colors.textMuted} />
        </Pressable>
        <AppText variant="headingXL">Alerts</AppText>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        {notifications.isLoading ? (
          <View style={{ gap: spacing.lg }}>
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} height={56} />
            ))}
          </View>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<BellOff size={26} color={colors.textMuted} strokeWidth={1.6} />}
            title="Nothing needs attention"
            message="Expiring passes, capacity warnings and long-open shifts show up here."
          />
        ) : (
          items.map((item, index) => {
            const Icon = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] ?? Ticket;
            const tint = item.severity === 'warning' ? colors.warning : colors.textMuted;
            return (
              <View key={item.id}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: spacing.lg,
                    paddingVertical: spacing.lg,
                    alignItems: 'center',
                  }}
                >
                  <Icon size={20} color={tint} strokeWidth={1.8} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodyMedium">{item.title}</AppText>
                    <AppText variant="bodySmall" color="textMuted" style={{ marginTop: 2 }}>
                      {item.message}
                    </AppText>
                  </View>
                </View>
                {index < items.length - 1 ? <Divider /> : null}
              </View>
            );
          })
        )}
      </View>
    </Screen>
  );
}
