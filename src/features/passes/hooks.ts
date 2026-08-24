import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { CreatePassPayload, passesService } from '@/services/business.service';

export function usePasses(params: { status?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.passes(params),
    queryFn: () => passesService.list(params),
    staleTime: 30000,
  });
}

function useInvalidatePasses() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['passes'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
  };
}

export function useCreatePass() {
  const invalidate = useInvalidatePasses();
  return useMutation({
    mutationFn: (payload: CreatePassPayload) => passesService.create(payload),
    onSuccess: invalidate,
  });
}

export function useRenewPass() {
  const invalidate = useInvalidatePasses();
  return useMutation({
    mutationFn: ({ id, months, amount }: { id: string; months: number; amount: number }) =>
      passesService.renew(id, months, amount),
    onSuccess: invalidate,
  });
}

export function useCancelPass() {
  const invalidate = useInvalidatePasses();
  return useMutation({
    mutationFn: (id: string) => passesService.cancel(id),
    onSuccess: invalidate,
  });
}
