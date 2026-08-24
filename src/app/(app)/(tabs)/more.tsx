import { router } from 'expo-router';
import {
  BarChart3,
  Bell,
  Check,
  Clock,
  LogOut,
  MapPin,
  Moon,
  Ticket,
  UserRound,
  Users,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { ROLE_LABELS } from '@/constants';
import { useNotifications } from '@/features/dashboard/hooks';
import { useAuthStore } from '@/store/auth.store';
import { ThemePreference, spacing, useTheme } from '@/theme';
import type { Role } from '@/types/models';

const APPEARANCE_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'Follow system' },
];

interface MenuItem {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  route: string;
  roles: Role[];
}

const MENU: MenuItem[] = [
  {
    title: 'Parking lots',
    subtitle: 'Locations, capacity, pricing',
    icon: MapPin,
    route: '/(app)/lots',
    roles: ['OWNER', 'MANAGER', 'ADMIN'],
  },
  {
    title: 'Monthly passes',
    subtitle: 'Regulars and renewals',
    icon: Ticket,
    route: '/(app)/passes',
    roles: ['OWNER', 'MANAGER', 'ATTENDANT', 'ADMIN'],
  },
  {
    title: 'Staff',
    subtitle: 'Team and lot assignments',
    icon: Users,
    route: '/(app)/staff',
    roles: ['OWNER', 'MANAGER', 'ADMIN'],
  },
  {
    title: 'My shift',
    subtitle: 'Start, end and collections',
    icon: Clock,
    route: '/(app)/shift',
    roles: ['OWNER', 'MANAGER', 'ATTENDANT', 'ADMIN'],
  },
  {
    title: 'Reports',
    subtitle: 'Revenue, trends, peak hours',
    icon: BarChart3,
    route: '/(app)/reports',
    roles: ['OWNER', 'MANAGER', 'ADMIN'],
  },
  {
    title: 'Alerts',
    subtitle: 'Expiring passes, capacity warnings',
    icon: Bell,
    route: '/(app)/alerts',
    roles: ['OWNER', 'MANAGER', 'ADMIN'],
  },
  {
    title: 'Profile & business',
    icon: UserRound,
    route: '/(app)/profile',
    roles: ['OWNER', 'MANAGER', 'ATTENDANT', 'ADMIN'],
  },
];

export default function MoreScreen() {
  const { colors, preference, setPreference } = useTheme();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const notifications = useNotifications();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  if (!user) return null;
  const visibleMenu = MENU.filter((item) => item.roles.includes(user.role));
  const alertCount = notifications.data?.length ?? 0;

  return (
    <Screen>
      <View style={{ paddingTop: spacing.xl, paddingBottom: spacing.xl }}>
        <AppText variant="headingXL">{user.fullName}</AppText>
        <AppText variant="body" color="textMuted" style={{ marginTop: spacing.xs }}>
          {user.business?.name ?? 'No business'} · {ROLE_LABELS[user.role] ?? user.role}
        </AppText>
      </View>

      {visibleMenu.map((item) => {
        const Icon = item.icon;
        return (
          <ListRow
            key={item.route}
            icon={<Icon size={20} color={colors.textMuted} strokeWidth={1.8} />}
            title={item.title}
            subtitle={item.subtitle}
            chevron
            right={
              item.route === '/(app)/alerts' && alertCount > 0 ? (
                <View
                  style={{
                    minWidth: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: colors.warning,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 6,
                  }}
                >
                  <AppText variant="bodySmall" color="background" style={{ fontSize: 11 }}>
                    {alertCount}
                  </AppText>
                </View>
              ) : undefined
            }
            onPress={() => router.push(item.route as never)}
          />
        );
      })}

      <ListRow
        icon={<Moon size={20} color={colors.textMuted} strokeWidth={1.8} />}
        title="Appearance"
        subtitle={APPEARANCE_OPTIONS.find((option) => option.value === preference)?.label}
        chevron
        onPress={() => setAppearanceOpen(true)}
      />

      <ListRow
        icon={<LogOut size={20} color={colors.danger} strokeWidth={1.8} />}
        title="Sign out"
        destructive
        divider={false}
        onPress={() => setConfirmSignOut(true)}
      />

      <Sheet
        visible={appearanceOpen}
        onClose={() => setAppearanceOpen(false)}
        title="Appearance"
      >
        {APPEARANCE_OPTIONS.map((option, index) => (
          <ListRow
            key={option.value}
            title={option.label}
            divider={index < APPEARANCE_OPTIONS.length - 1}
            right={
              preference === option.value ? (
                <Check size={18} color={colors.accent} />
              ) : undefined
            }
            onPress={() => {
              setPreference(option.value);
              setAppearanceOpen(false);
            }}
          />
        ))}
      </Sheet>

      <Sheet
        visible={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        title="Sign out?"
      >
        <AppText variant="body" color="textMuted" style={{ marginBottom: spacing.xl }}>
          You will need to sign in again to manage {user.business?.name ?? 'your parking'}.
        </AppText>
        <Button
          title="Sign out"
          variant="danger"
          loading={signingOut}
          onPress={() => {
            setSigningOut(true);
            void signOut();
          }}
        />
        <Button
          title="Stay signed in"
          variant="ghost"
          onPress={() => setConfirmSignOut(false)}
          style={{ marginTop: spacing.sm }}
        />
      </Sheet>
    </Screen>
  );
}
