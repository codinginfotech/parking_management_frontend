import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { analyticsService, reportsService } from '@/services/business.service';

export function useDailyReport(date?: string, lotId?: string) {
  return useQuery({
    queryKey: queryKeys.dailyReport(date, lotId),
    queryFn: () => reportsService.daily(date, lotId),
    staleTime: 30000,
  });
}

export function useTrends(days: number, lotId?: string) {
  return useQuery({
    queryKey: queryKeys.trends(days, lotId),
    queryFn: () => analyticsService.trends(days, lotId),
    staleTime: 60000,
  });
}

export function usePeakHours(lotId?: string) {
  return useQuery({
    queryKey: queryKeys.peakHours(lotId),
    queryFn: () => analyticsService.peakHours(lotId),
    staleTime: 5 * 60000,
  });
}
