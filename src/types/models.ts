export type Role = 'OWNER' | 'MANAGER' | 'ATTENDANT' | 'ADMIN';
export type VehicleType = 'TWO_WHEELER' | 'CAR' | 'SUV' | 'COMMERCIAL';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'OTHER';
export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type PricingMode = 'FLAT' | 'HOURLY' | 'SLAB';
export type AuthProvider = 'EMAIL' | 'GOOGLE';
export type PassStatus = 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'CANCELLED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: Role;
  authProvider: AuthProvider;
  isEmailVerified: boolean;
  assignedLotIds: string[];
  business: { id: string; name: string } | null;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PricingSlab {
  uptoMinutes: number;
  amount: number;
}

export interface PricingRule {
  vehicleType: VehicleType;
  mode: PricingMode;
  flatRate?: number;
  firstHourRate?: number;
  additionalHourRate?: number;
  slabs?: PricingSlab[];
  overflowHourlyRate?: number;
  dailyMax?: number;
}

export interface CapacityEntry {
  vehicleType: VehicleType;
  spaces: number;
}

export interface OccupancyByType {
  vehicleType: VehicleType;
  capacity: number;
  occupied: number;
}

export interface Occupancy {
  lotId: string;
  capacity: number;
  occupied: number;
  available: number;
  byType: OccupancyByType[];
}

export interface ParkingLot {
  _id: string;
  name: string;
  address?: string;
  capacity: CapacityEntry[];
  pricing: PricingRule[];
  operatingHours: { is24Hours: boolean; open?: string; close?: string };
  isActive: boolean;
  totalCapacity: number;
  occupied?: number;
  available?: number;
  occupancy?: Occupancy;
  createdAt: string;
}

export interface Slot {
  _id: string;
  code: string;
  vehicleType?: VehicleType;
  status: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED';
  activeSession?: { vehicleNumber: string; vehicleType: VehicleType; entryTime: string };
}

export interface ParkingSession {
  _id: string;
  lot: string;
  lotName?: string;
  vehicleNumber: string;
  displayNumber: string;
  vehicleType: VehicleType;
  slotCode?: string;
  status: SessionStatus;
  entryTime: string;
  exitTime?: string;
  durationMinutes?: number;
  amount?: number;
  estimatedAmount?: number;
  currentAmount?: number;
  coveredByPass: boolean;
  slipNumber?: number;
  notes?: string;
}

export interface PaymentReceipt {
  id: string;
  amount: number;
  method: PaymentMethod;
  receiptNumber: string;
  paidAt: string;
}

export interface Payment {
  _id: string;
  amount: number;
  method: PaymentMethod;
  status: string;
  receiptNumber: string;
  paidAt: string;
  collectedBy?: { fullName: string };
  session?: { vehicleNumber: string; vehicleType: VehicleType; durationMinutes?: number };
}

export interface MonthlyPass {
  _id: string;
  vehicleNumber: string;
  displayNumber: string;
  vehicleType: VehicleType;
  holderName: string;
  holderPhone?: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CANCELLED';
  effectiveStatus: PassStatus;
}

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  assignedLotIds: string[];
  isActive: boolean;
}

export interface ShiftCollections {
  CASH: number;
  UPI: number;
  CARD: number;
  OTHER: number;
}

export interface StaffShift {
  _id: string;
  lot: { _id: string; name: string } | string;
  staff?: { fullName: string; role: Role };
  status: 'OPEN' | 'CLOSED';
  startTime: string;
  endTime?: string;
  collections: ShiftCollections;
  totalCollected: number;
  sessionsStarted: number;
  sessionsClosed: number;
}

export interface ActivityItem {
  _id: string;
  action: string;
  actorName: string;
  description: string;
  createdAt: string;
  meta?: { amount?: number; method?: PaymentMethod };
}

export interface Overview {
  todayRevenue: number;
  vehiclesServedToday: number;
  currentlyParked: number;
  capacity: number;
  available: number;
  avgDurationMinutesToday: number;
  activePasses: number;
}

export interface DailyReport {
  date: string;
  revenue: number;
  paymentsCount: number;
  vehiclesEntered: number;
  vehiclesExited: number;
  avgDurationMinutes: number;
  methodBreakdown: { method: PaymentMethod; total: number; count: number }[];
  vehicleTypeBreakdown: { vehicleType: VehicleType; count: number; revenue: number }[];
  staffCollections: { staffId: string; name: string; total: number; count: number }[];
}

export interface TrendPoint {
  date: string;
  revenue: number;
  sessions: number;
}

export interface PeakHour {
  hour: number;
  entries: number;
}

export interface VehicleSearchResult {
  id: string;
  number: string;
  displayNumber: string;
  type: VehicleType;
  totalVisits: number;
  lastVisitAt?: string;
  isParked: boolean;
}

export interface AppNotification {
  id: string;
  type: string;
  severity: 'info' | 'warning';
  title: string;
  message: string;
  at: string;
}
