import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuProduct, PaymentAccount, Sector, StoreStatus } from '../store/store.model';
import { CreateOrderRequest, Order, OrderBoard, OrderCreated, PublicOrder } from './order.model';

export type OrderAction = 'start' | 'left-kitchen' | 'picked-up' | 'delivered';

/** Orders API: public (customer) and staff endpoints. */
@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  // ---------- Public ----------
  storeStatus(): Observable<StoreStatus> {
    return this.http.get<StoreStatus>(`${this.api}/store/status`);
  }

  menu(): Observable<MenuProduct[]> {
    return this.http.get<MenuProduct[]>(`${this.api}/store/menu`);
  }

  sectors(): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.api}/store/sectors`);
  }

  paymentAccounts(): Observable<PaymentAccount[]> {
    return this.http.get<PaymentAccount[]>(`${this.api}/store/payment-accounts`);
  }

  qrUrl(accountId: number): string {
    return `${this.api}/store/payment-accounts/${accountId}/qr`;
  }

  create(request: CreateOrderRequest): Observable<OrderCreated> {
    return this.http.post<OrderCreated>(`${this.api}/orders`, request);
  }

  track(code: string): Observable<PublicOrder> {
    return this.http.get<PublicOrder>(`${this.api}/orders/track/${encodeURIComponent(code)}`);
  }

  uploadReceipt(code: string, file: File): Observable<PublicOrder> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<PublicOrder>(`${this.api}/orders/track/${encodeURIComponent(code)}/receipt`, form);
  }

  // ---------- Staff ----------
  board(): Observable<OrderBoard> {
    return this.http.get<OrderBoard>(`${this.api}/orders/board`);
  }

  advance(id: number, action: OrderAction): Observable<Order> {
    return this.http.post<Order>(`${this.api}/orders/${id}/${action}`, null);
  }

  // ---------- Admin ----------
  receipt(id: number): Observable<Blob> {
    return this.http.get(`${this.api}/orders/${id}/receipt`, { responseType: 'blob' });
  }

  approvePayment(id: number): Observable<Order> {
    return this.http.post<Order>(`${this.api}/orders/${id}/payment/approve`, null);
  }

  rejectPayment(id: number, reason: string): Observable<Order> {
    return this.http.post<Order>(`${this.api}/orders/${id}/payment/reject`, { reason });
  }

  cancel(id: number, reason: string | null): Observable<Order> {
    return this.http.post<Order>(`${this.api}/orders/${id}/cancel`, { reason });
  }
}
