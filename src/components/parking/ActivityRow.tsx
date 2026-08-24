import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  Clock,
  IndianRupee,
  Ticket,
  UserPlus,
} from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { spacing, useTheme } from '@/theme';
import type { ActivityItem } from '@/types/models';
import { formatRupees } from '@/utils/currency';
import { formatRelative } from '@/utils/datetime';
import { AppText } from '../ui/AppText';
import { Divider } from '../ui/Divider';

function iconFor(action: string) {
  if (action === 'VEHICLE_ENTRY') return ArrowDownLeft;
  if (action === 'VEHICLE_EXIT') return ArrowUpRight;
  if (action === 'PAYMENT_COLLECTED') return IndianRupee;
  if (action.startsWith('PASS_')) return Ticket;
  if (action.startsWith('SHIFT_')) return Clock;
  if (action.startsWith('STAFF_')) return UserPlus;
  return BadgeCheck;
}

export function ActivityRow({ item, divider = true }: { item: ActivityItem; divider?: boolean }) {
  const { colors } = useTheme();
  const Icon = iconFor(item.action);
  const amount = item.meta?.amount;

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.lg,
          paddingVertical: spacing.md,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: colors.surfaceHigh,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} color={colors.textMuted} strokeWidth={1.8} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="body" numberOfLines={2}>
            {item.description}
          </AppText>
          <AppText variant="bodySmall" color="textFaint" style={{ marginTop: 2 }}>
            {item.actorName} · {formatRelative(item.createdAt)}
          </AppText>
        </View>
        {typeof amount === 'number' && amount > 0 ? (
          <AppText variant="numeric" color="success">
            {formatRupees(amount)}
          </AppText>
        ) : null}
      </View>
      {divider ? <Divider /> : null}
    </View>
  );
}
