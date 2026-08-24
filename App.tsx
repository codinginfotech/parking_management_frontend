import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@/components/ui/Toast';
import { setupOnlineManager } from '@/hooks/use-network';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useAuthStore } from '@/store/auth.store';
import { useLotStore } from '@/store/lot.store';
import { ThemeProvider, useTheme } from '@/theme';

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

function ThemedApp() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const hydrateLot = useLotStore((state) => state.hydrate);
  const authStatus = useAuthStore((state) => state.status);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    void Promise.all([bootstrap(), hydrateLot()]).finally(() => setBooted(true));
  }, [bootstrap, hydrateLot]);

  // The native window background (dark) shows until the tree is ready.
  const ready = booted && authStatus !== 'booting';
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <ThemedApp />
            </ToastProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
