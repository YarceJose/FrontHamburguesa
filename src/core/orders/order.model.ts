export type OrderStatus =
  | 'AwaitingPayment'
  | 'PaymentReview'
  | 'Received'
  | 'Preparing'
  | 'LeftKitchen'
  | 'PickedUp'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'Cash' | 'Transfer';

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

/** Full order for staff screens and real-time events. */
export interface Order {
  id: number;
  code: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  sectorName: string;
  items: OrderItem[];
  total: number;
  estimatedMinutes: number;
  paymentMethod: PaymentMethod;
  cashAmount: number | null;
  hasReceipt: boolean;
  paymentRejectReason: string | null;
  createdAt: string;
  receivedAt: string | null;
  startedAt: string | null;
  leftKitchenAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  cookId: number | null;
  deliveryUserId: number | null;
  delayAlertSent: boolean;
  escalationSent: boolean;
}

/** What the customer sees when following an order. */
export interface PublicOrder {
  code: string;
  status: OrderStatus;
  customerFirstName: string;
  sectorName: string;
  items: OrderItem[];
  total: number;
  estimatedMinutes: number;
  paymentMethod: PaymentMethod;
  paymentRejectReason: string | null;
  createdAt: string;
  receivedAt: string | null;
  leftKitchenAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
}

export interface OrderBoard {
  active: Order[];
  recentFinished: Order[];
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  sectorId: number | null;
  otherSector: string | null;
  items: { productId: number; quantity: number }[];
  paymentMethod: PaymentMethod;
  cashAmount: number | null;
}

export interface OrderCreated {
  code: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
  estimatedMinutes: number;
  createdAt: string;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  AwaitingPayment: 'Esperando pago',
  PaymentReview: 'Revisando pago',
  Received: 'Recibido',
  Preparing: 'En preparación',
  LeftKitchen: 'Salió de cocina',
  PickedUp: 'En camino',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado',
};
