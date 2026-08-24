import { Bike, Car, CarFront, Truck } from 'lucide-react-native';
import type { PaymentMethod, VehicleType } from '@/types/models';

export const VEHICLE_TYPE_OPTIONS: {
  value: VehicleType;
  label: string;
  Icon: typeof Car;
}[] = [
  { value: 'TWO_WHEELER', label: 'Two Wheeler', Icon: Bike },
  { value: 'CAR', label: 'Car', Icon: Car },
  { value: 'SUV', label: 'SUV', Icon: CarFront },
  { value: 'COMMERCIAL', label: 'Commercial', Icon: Truck },
];

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  TWO_WHEELER: 'Two Wheeler',
  CAR: 'Car',
  SUV: 'SUV',
  COMMERCIAL: 'Commercial',
};

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Card' },
  { value: 'OTHER', label: 'Other' },
];

export const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  ATTENDANT: 'Attendant',
  ADMIN: 'Admin',
};
