import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { SOCKET_EVENTS, getSocket } from '@/services/socket';
import { useAuthStore } from '@/store/auth.store';

/**
 * Subscribes to realtime events and invalidates affected queries so every
 * screen stays live while the app is open.
 */
export function useRealtimeUpdates(): void {
  const queryClient = useQueryClient();
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const socket = getSocket();
    if (!socket) return;

    const invalidateOperational = () => {
      void queryClient.invalidateQueries({ queryKey: ['sessions'] });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
    };
    const invalidateOccupancy = () => {
      void queryClient.invalidateQueries({ queryKey: ['lots'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      void queryClient.invalidateQueries({ queryKey: ['slots'] });
    };
    const invalidatePayments = () => {
      void queryClient.invalidateQueries({ queryKey: ['payments'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      void queryClient.invalidateQueries({ queryKey: ['shifts'] });
    };

    socket.on(SOCKET_EVENTS.VEHICLE_ENTERED, invalidateOperational);
    socket.on(SOCKET_EVENTS.VEHICLE_EXITED, invalidateOperational);
    socket.on(SOCKET_EVENTS.OCCUPANCY_UPDATED, invalidateOccupancy);
    socket.on(SOCKET_EVENTS.PAYMENT_RECEIVED, invalidatePayments);

    return () => {
      socket.off(SOCKET_EVENTS.VEHICLE_ENTERED, invalidateOperational);
      socket.off(SOCKET_EVENTS.VEHICLE_EXITED, invalidateOperational);
      socket.off(SOCKET_EVENTS.OCCUPANCY_UPDATED, invalidateOccupancy);
      socket.off(SOCKET_EVENTS.PAYMENT_RECEIVED, invalidatePayments);
    };
  }, [queryClient, status]);
}
