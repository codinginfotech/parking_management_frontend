import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@/components/ui/Toast';
import { setupOnlineManager } from '@/hooks/use-network';
import { useAuthStore } from '@/store/auth.store';
import { useLotStore } from '@/store/lot.store';
import { ThemeProvider, useTheme } from '@/theme';
import { fontMap } from '@/theme/fonts';

void SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 15000,
      // Keep cached data around long enough to survive brief offline periods.
      gcTime: 60 * 60 * 1000,
    },
  },
});

setupOnlineManager();

function RootNavigator() {
  const { isDark, colors } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 220,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts(fontMap);
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const hydrateLot = useLotStore((state) => state.hydrate);
  const authStatus = useAuthStore((state) => state.status);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    void Promise.all([bootstrap(), hydrateLot()]).finally(() => setBooted(true));
  }, [bootstrap, hydrateLot]);

  const ready = booted && (fontsLoaded || Boolean(fontsError)) && authStatus !== 'booting';

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <RootNavigator />
            </ToastProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
