import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from '@/theme';

export default function AuthLayout() {
  const status = useAuthStore((state) => state.status);
  const { colors } = useTheme();

  if (status === 'authenticated') {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
