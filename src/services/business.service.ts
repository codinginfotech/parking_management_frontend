import type { ApiResponse, Paginated } from '@/types/api';
import type {
  AppNotification,
  DailyReport,
  MonthlyPass,
  PeakHour,
  Overview,
  Payment,
  StaffMember,
  StaffShift,
  TrendPoint,
  VehicleType,
} from '@/types/models';
import { api } from './api';

export const analyticsService = {
  async overview(lotId?: string): Promise<Overview> {
    const res = await api.get<ApiResponse<{ overview: Overview }>>(
      '/analytics/overview',
      { params: lotId ? { lotId } : {} }
    );
    return res.data.data.overview;
  },
  async trends(days: number, lotId?: string): Promise<TrendPoint[]> {
    const res = await api.get<ApiResponse<{ series: TrendPoint[] }>>(
      '/analytics/trends',
      { params: { days, ...(lotId ? { lotId } : {}) } }
    );
    return res.data.data.series;
  },
  async peakHours(lotId?: string): Promise<PeakHour[]> {
    const res = await api.get<ApiResponse<{ hours: PeakHour[] }>>(
      '/analytics/peak-hours',
      { params: lotId ? { lotId } : {} }
    );
    return res.data.data.hours;
  },
};

export const reportsService = {
  async daily(date?: string, lotId?: string): Promise<DailyReport> {
    const res = await api.get<ApiResponse<{ report: DailyReport }>>('/reports/daily', {
      params: { ...(date ? { date } : {}), ...(lotId ? { lotId } : {}) },
    });
    return res.data.data.report;
  },
};

export interface CreatePassPayload {
  lotId?: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  holderName: string;
  holderPhone?: string;
  amount: number;
  startDate: string;
  months: number;
}

export const passesService = {
  async list(params: {
    status?: string;
    search?: string;
    page?: number;
  }): Promise<Paginated<MonthlyPass>> {
    const res = await api.get<ApiResponse<Paginated<MonthlyPass>>>('/passes', { params });
    return res.data.data;
  },
  async create(payload: CreatePassPayload): Promise<MonthlyPass> {
    const res = await api.post<ApiResponse<{ pass: MonthlyPass }>>('/passes', payload);
    return res.data.data.pass;
  },
  async renew(id: string, months: number, amount: number): Promise<MonthlyPass> {
    const res = await api.post<ApiResponse<{ pass: MonthlyPass }>>(
      `/passes/${id}/renew`,
      { months, amount }
    );
    return res.data.data.pass;
  },
  async cancel(id: string): Promise<MonthlyPass> {
    const res = await api.post<ApiResponse<{ pass: MonthlyPass }>>(`/passes/${id}/cancel`);
    return res.data.data.pass;
  },
  async expiring(days = 7): Promise<MonthlyPass[]> {
    const res = await api.get<ApiResponse<{ passes: MonthlyPass[] }>>(
      '/passes/expiring',
      { params: { days } }
    );
    return res.data.data.passes;
  },
};

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: 'MANAGER' | 'ATTENDANT';
  assignedLotIds: string[];
}

export const staffService = {
  async list(): Promise<StaffMember[]> {
    const res = await api.get<ApiResponse<{ staff: StaffMember[] }>>('/staff');
    return res.data.data.staff;
  },
  async create(payload: CreateStaffPayload): Promise<StaffMember> {
    const res = await api.post<ApiResponse<{ staff: StaffMember }>>('/staff', payload);
    return res.data.data.staff;
  },
  async update(
    id: string,
    payload: Partial<Omit<CreateStaffPayload, 'email' | 'password'>> & {
      isActive?: boolean;
    }
  ): Promise<StaffMember> {
    const res = await api.patch<ApiResponse<{ staff: StaffMember }>>(
      `/staff/${id}`,
      payload
    );
    return res.data.data.staff;
  },
};

export const shiftsService = {
  async current(): Promise<StaffShift | null> {
    const res = await api.get<ApiResponse<{ shift: StaffShift | null }>>(
      '/shifts/current'
    );
    return res.data.data.shift;
  },
  async start(lotId: string, openingNote?: string): Promise<StaffShift> {
    const res = await api.post<ApiResponse<{ shift: StaffShift }>>('/shifts/start', {
      lotId,
      ...(openingNote ? { openingNote } : {}),
    });
    return res.data.data.shift;
  },
  async end(closingNote?: string): Promise<StaffShift> {
    const res = await api.post<ApiResponse<{ shift: StaffShift }>>('/shifts/end', {
      ...(closingNote ? { closingNote } : {}),
    });
    return res.data.data.shift;
  },
  async list(params: { lotId?: string; page?: number }): Promise<Paginated<StaffShift>> {
    const res = await api.get<ApiResponse<Paginated<StaffShift>>>('/shifts', { params });
    return res.data.data;
  },
};

export const paymentsService = {
  async list(params: {
    lotId?: string;
    method?: string;
    date?: string;
    page?: number;
  }): Promise<Paginated<Payment>> {
    const res = await api.get<ApiResponse<Paginated<Payment>>>('/payments', { params });
    return res.data.data;
  },
};

export const notificationsService = {
  async list(): Promise<AppNotification[]> {
    const res = await api.get<ApiResponse<{ notifications: AppNotification[] }>>(
      '/notifications'
    );
    return res.data.data.notifications;
  },
};
