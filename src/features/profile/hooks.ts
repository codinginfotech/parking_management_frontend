import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { authService } from '@/services/auth.service';
import {
  CreateStaffPayload,
  shiftsService,
  staffService,
} from '@/services/business.service';
import { useAuthStore } from '@/store/auth.store';

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: (update: { fullName?: string; phone?: string }) =>
      authService.updateProfile(update),
    onSuccess: (user) => setUser(user),
  });
}

export function useStaff() {
  return useQuery({
    queryKey: queryKeys.staff,
    queryFn: () => staffService.list(),
    staleTime: 30000,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => staffService.create(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.staff }),
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      fullName?: string;
      phone?: string;
      role?: 'MANAGER' | 'ATTENDANT';
      assignedLotIds?: string[];
      isActive?: boolean;
    }) => staffService.update(id, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.staff }),
  });
}

export function useCurrentShift() {
  return useQuery({
    queryKey: queryKeys.currentShift,
    queryFn: () => shiftsService.current(),
    staleTime: 15000,
  });
}

function useInvalidateShifts() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['shifts'] });
    void queryClient.invalidateQueries({ queryKey: ['activity'] });
  };
}

export function useStartShift() {
  const invalidate = useInvalidateShifts();
  return useMutation({
    mutationFn: ({ lotId, openingNote }: { lotId: string; openingNote?: string }) =>
      shiftsService.start(lotId, openingNote),
    onSuccess: invalidate,
  });
}

export function useEndShift() {
  const invalidate = useInvalidateShifts();
  return useMutation({
    mutationFn: (closingNote?: string) => shiftsService.end(closingNote),
    onSuccess: invalidate,
  });
}

export function useShiftHistory(params: { lotId?: string }) {
  return useQuery({
    queryKey: queryKeys.shifts(params),
    queryFn: () => shiftsService.list(params),
    staleTime: 30000,
  });
}
