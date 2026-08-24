import type { ApiResponse, Paginated } from '@/types/api';
import type {
  ActivityItem,
  CapacityEntry,
  Occupancy,
  ParkingLot,
  ParkingSession,
  PaymentMethod,
  PaymentReceipt,
  PricingRule,
  Slot,
  VehicleSearchResult,
  VehicleType,
} from '@/types/models';
import { api } from './api';

export interface CreateLotPayload {
  name: string;
  address?: string;
  capacity: CapacityEntry[];
  pricing: PricingRule[];
  operatingHours: { is24Hours: boolean; open?: string; close?: string };
}

export const lotsService = {
  async list(): Promise<ParkingLot[]> {
    const res = await api.get<ApiResponse<{ lots: ParkingLot[] }>>('/parking-lots');
    return res.data.data.lots;
  },
  async detail(id: string): Promise<ParkingLot> {
    const res = await api.get<ApiResponse<{ lot: ParkingLot }>>(`/parking-lots/${id}`);
    return res.data.data.lot;
  },
  async create(payload: CreateLotPayload): Promise<ParkingLot> {
    const res = await api.post<ApiResponse<{ lot: ParkingLot }>>('/parking-lots', payload);
    return res.data.data.lot;
  },
  async update(id: string, payload: Partial<CreateLotPayload> & { isActive?: boolean }) {
    const res = await api.patch<ApiResponse<{ lot: ParkingLot }>>(
      `/parking-lots/${id}`,
      payload
    );
    return res.data.data.lot;
  },
  async occupancy(id: string): Promise<Occupancy> {
    const res = await api.get<ApiResponse<{ occupancy: Occupancy }>>(
      `/parking-lots/${id}/occupancy`
    );
    return res.data.data.occupancy;
  },
};

export const slotsService = {
  async list(lotId: string, status?: string): Promise<Slot[]> {
    const res = await api.get<ApiResponse<{ slots: Slot[] }>>('/slots', {
      params: { lotId, status },
    });
    return res.data.data.slots;
  },
  async createBulk(payload: {
    lotId: string;
    prefix: string;
    from: number;
    to: number;
    vehicleType?: VehicleType;
  }) {
    const res = await api.post<ApiResponse<{ created: number; skipped: number }>>(
      '/slots/bulk',
      payload
    );
    return res.data.data;
  },
  async update(id: string, payload: { status?: 'AVAILABLE' | 'BLOCKED' }) {
    const res = await api.patch<ApiResponse<{ slot: Slot }>>(`/slots/${id}`, payload);
    return res.data.data.slot;
  },
};

export interface EntryPayload {
  lotId: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  slotId?: string;
  notes?: string;
}

export interface EntryResult {
  session: ParkingSession;
  occupancy: Occupancy;
}

export interface ExitResult {
  session: ParkingSession;
  payment: PaymentReceipt | null;
}

export const sessionsService = {
  async entry(payload: EntryPayload): Promise<EntryResult> {
    const res = await api.post<ApiResponse<EntryResult>>(
      '/parking-sessions/entry',
      payload
    );
    return res.data.data;
  },
  async active(params: {
    lotId?: string;
    search?: string;
    vehicleType?: VehicleType;
    sort?: 'newest' | 'oldest';
    limit?: number;
  }): Promise<Paginated<ParkingSession>> {
    const res = await api.get<ApiResponse<Paginated<ParkingSession>>>(
      '/parking-sessions/active',
      { params }
    );
    return res.data.data;
  },
  async lookup(vehicleNumber: string): Promise<ParkingSession> {
    const res = await api.get<ApiResponse<{ session: ParkingSession }>>(
      '/parking-sessions/lookup',
      { params: { vehicleNumber } }
    );
    return res.data.data.session;
  },
  async preview(id: string): Promise<ParkingSession> {
    const res = await api.get<ApiResponse<{ session: ParkingSession }>>(
      `/parking-sessions/${id}`
    );
    return res.data.data.session;
  },
  async exit(
    id: string,
    payload: { paymentMethod?: PaymentMethod; transactionRef?: string }
  ): Promise<ExitResult> {
    const res = await api.post<ApiResponse<ExitResult>>(
      `/parking-sessions/${id}/exit`,
      payload
    );
    return res.data.data;
  },
  async cancel(id: string, reason: string): Promise<ParkingSession> {
    const res = await api.post<ApiResponse<{ session: ParkingSession }>>(
      `/parking-sessions/${id}/cancel`,
      { reason }
    );
    return res.data.data.session;
  },
  async history(params: {
    lotId?: string;
    date?: string;
    search?: string;
    page?: number;
  }): Promise<Paginated<ParkingSession>> {
    const res = await api.get<ApiResponse<Paginated<ParkingSession>>>(
      '/parking-sessions/history',
      { params }
    );
    return res.data.data;
  },
};

export const vehiclesService = {
  async search(q: string): Promise<VehicleSearchResult[]> {
    const res = await api.get<ApiResponse<{ vehicles: VehicleSearchResult[] }>>(
      '/vehicles/search',
      { params: { q } }
    );
    return res.data.data.vehicles;
  },
};

export const activityService = {
  async list(params: {
    lotId?: string;
    page?: number;
    limit?: number;
  }): Promise<Paginated<ActivityItem>> {
    const res = await api.get<ApiResponse<Paginated<ActivityItem>>>('/activity', {
      params,
    });
    return res.data.data;
  },
};
