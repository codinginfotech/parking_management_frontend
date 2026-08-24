import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import { useRealtimeUpdates } from '@/hooks/use-realtime';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from '@/theme';

export default function AppLayout() {
  const status = useAuthStore((state) => state.status);
  const { colors } = useTheme();
  useRealtimeUpdates();

  if (status !== 'authenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="entry"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="exit"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </>
  );
}
