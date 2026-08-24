import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

/**
 * Bridges NetInfo into TanStack Query's online manager (queries pause and
 * auto-refetch on reconnect) and exposes the status for the offline banner.
 */
export function setupOnlineManager(): void {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false);
    })
  );
}

export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected !== false);
    });
    return unsubscribe;
  }, []);
  return isOnline;
}
