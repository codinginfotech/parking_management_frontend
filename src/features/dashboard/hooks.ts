import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys } from '@/constants/query-keys';
import { analyticsService, notificationsService } from '@/services/business.service';
import { activityService, lotsService } from '@/services/parking.service';
import { useLotStore } from '@/store/lot.store';

export function useOverview(lotId?: string) {
  return useQuery({
    queryKey: queryKeys.overview(lotId),
    queryFn: () => analyticsService.overview(lotId),
    staleTime: 15000,
    refetchInterval: 60000,
  });
}

export function useLots() {
  const reconcile = useLotStore((state) => state.reconcile);
  const query = useQuery({
    queryKey: queryKeys.lots,
    queryFn: () => lotsService.list(),
    staleTime: 30000,
  });
  useEffect(() => {
    if (query.data) reconcile(query.data);
  }, [query.data, reconcile]);
  return query;
}

export function useLotDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.lot(id ?? 'none'),
    queryFn: () => lotsService.detail(id as string),
    enabled: Boolean(id),
    staleTime: 15000,
  });
}

export function useRecentActivity(lotId?: string, limit = 6) {
  return useQuery({
    queryKey: queryKeys.activity({ lotId: lotId ?? 'all', limit }),
    queryFn: () => activityService.list({ lotId, limit, page: 1 }),
    staleTime: 15000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationsService.list(),
    staleTime: 60000,
  });
}

/** The lot the operator is working at, resolved against the loaded lot list. */
export function useActiveLot() {
  const { data: lots } = useLots();
  const activeLotId = useLotStore((state) => state.activeLotId);
  const setActiveLot = useLotStore((state) => state.setActiveLot);
  const activeLot = lots?.find((lot) => lot._id === activeLotId) ?? lots?.[0];
  return { lots: lots ?? [], activeLot, setActiveLot };
}
