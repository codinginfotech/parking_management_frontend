import { Redirect } from 'expo-router';
import React from 'react';
import { useAuthStore } from '@/store/auth.store';

export default function Index() {
  const status = useAuthStore((state) => state.status);
  if (status === 'authenticated') {
    return <Redirect href="/(app)/(tabs)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
