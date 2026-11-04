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
  /** External picture link (used when there is no uploaded picture). */
  imageUrl: string | null;
  /** Set when the admin uploaded a picture; changes with every new one. */
  imageVersion: number | null;
}

/** Admin view of a product, hidden ones included. */
export interface AdminProduct extends MenuProduct {
  isActive: boolean;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  price: number;
  category: string | null;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

/** Menu tabs: known categories get a nice label, any other one is capitalized. */
export const CATEGORY_LABELS: Record<string, string> = {
  hamburguesas: 'Hamburguesas',
  carnes: 'Carnes',
  perros: 'Perros',
  salchipapas: 'Salchipapas',
  bebidas: 'Bebidas',
  adiciones: 'Adiciones',
};

export function categoryLabel(category: string | null): string {
  const id = category ?? 'otros';
  return CATEGORY_LABELS[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

/** Uploaded picture first, then the external link, then nothing (the card shows the logo). */
export function productImageSrc(product: MenuProduct, apiUrl: string): string | null {
  return product.imageVersion !== null
    ? `${apiUrl}/store/products/${product.id}/image?v=${product.imageVersion}`
    : product.imageUrl;
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
