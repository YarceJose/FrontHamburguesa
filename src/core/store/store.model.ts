export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export const DAYS: { value: DayOfWeek; short: string }[] = [
  { value: 'Monday', short: 'Lun' },
  { value: 'Tuesday', short: 'Mar' },
  { value: 'Wednesday', short: 'Mié' },
  { value: 'Thursday', short: 'Jue' },
  { value: 'Friday', short: 'Vie' },
  { value: 'Saturday', short: 'Sáb' },
  { value: 'Sunday', short: 'Dom' },
];

/** reason: null (open), 'closed', 'outside_schedule' or 'at_capacity'. */
export interface StoreStatus {
  isOpen: boolean;
  acceptingOrders: boolean;
  reason: 'closed' | 'outside_schedule' | 'at_capacity' | null;
  estimatedMinutes: number;
  activeOrders: number;
  opensAt: string;
  closesAt: string;
  openDays: DayOfWeek[];
}

export interface StoreSettings {
  isOpen: boolean;
  opensAt: string;
  closesAt: string;
  openDays: DayOfWeek[];
  basePrepMinutes: number;
  ordersBeforeDelay: number;
  extraMinutesPerOrder: number;
  maxActiveOrders: number;
  alertAfterMinutes: number;
  escalateAfterMinutes: number;
  paymentTimeoutMinutes: number;
}

export interface MenuProduct {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  price: number;
  imageUrl: string | null;
}

export interface Sector {
  id: number;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PaymentAccount {
  id: number;
  provider: string;
  holderName: string;
  accountReference: string;
  hasQr: boolean;
  isActive: boolean;
  sortOrder: number;
}
