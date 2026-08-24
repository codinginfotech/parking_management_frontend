import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import {
  EntryPayload,
  sessionsService,
  slotsService,
  vehiclesService,
} from '@/services/parking.service';
import type { PaymentMethod, VehicleType } from '@/types/models';

export function useActiveSessions(params: {
  lotId?: string;
  search?: string;
  vehicleType?: VehicleType;
  sort?: 'newest' | 'oldest';
}) {
  return useQuery({
    queryKey: queryKeys.activeSessions(params),
    queryFn: () => sessionsService.active({ ...params, limit: 100 }),
    staleTime: 15000,
    refetchInterval: 60000,
  });
}

export function useSessionPreview(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.session(id ?? 'none'),
    queryFn: () => sessionsService.preview(id as string),
    enabled: Boolean(id),
    refetchInterval: 30000,
  });
}

export function useAvailableSlots(lotId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.slots(lotId ?? 'none'),
    queryFn: () => slotsService.list(lotId as string, 'AVAILABLE'),
    enabled: Boolean(lotId),
    staleTime: 10000,
  });
}

export function useVehicleSearch(q: string) {
  return useQuery({
    queryKey: queryKeys.vehicleSearch(q),
    queryFn: () => vehiclesService.search(q),
    enabled: q.trim().length >= 2,
    staleTime: 10000,
  });
}

function useInvalidateOperational() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['sessions'] });
    void queryClient.invalidateQueries({ queryKey: ['overview'] });
    void queryClient.invalidateQueries({ queryKey: ['lots'] });
    void queryClient.invalidateQueries({ queryKey: ['slots'] });
    void queryClient.invalidateQueries({ queryKey: ['activity'] });
  };
}

export function useVehicleEntry() {
  const invalidate = useInvalidateOperational();
  return useMutation({
    mutationFn: (payload: EntryPayload) => sessionsService.entry(payload),
    onSuccess: invalidate,
  });
}

export function useVehicleLookup() {
  return useMutation({
    mutationFn: (vehicleNumber: string) => sessionsService.lookup(vehicleNumber),
  });
}

export function useVehicleExit() {
  const invalidate = useInvalidateOperational();
  return useMutation({
    mutationFn: ({
      sessionId,
      paymentMethod,
      transactionRef,
    }: {
      sessionId: string;
      paymentMethod?: PaymentMethod;
      transactionRef?: string;
    }) => sessionsService.exit(sessionId, { paymentMethod, transactionRef }),
    onSuccess: invalidate,
  });
}

export function useCancelSession() {
  const invalidate = useInvalidateOperational();
  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason: string }) =>
      sessionsService.cancel(sessionId, reason),
    onSuccess: invalidate,
  });
}
