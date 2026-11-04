import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminProduct, PaymentAccount, ProductRequest, Sector, StoreSettings, StoreStatus } from './store.model';

export interface SectorRequest {
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface PaymentAccountRequest {
  provider: string;
  holderName: string;
  accountReference: string;
  sortOrder: number;
  isActive: boolean;
}

/** Admin store configuration: rules, day open/close, menu products, sectors and payment accounts. */
@Injectable({ providedIn: 'root' })
export class StoreAdminService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  settings(): Observable<StoreSettings> {
    return this.http.get<StoreSettings>(`${this.api}/store/settings`);
  }

  saveSettings(settings: StoreSettings): Observable<StoreSettings> {
    return this.http.put<StoreSettings>(`${this.api}/store/settings`, settings);
  }

  closeDay(): Observable<StoreStatus> {
    return this.http.post<StoreStatus>(`${this.api}/store/close-day`, null);
  }

  openDay(): Observable<StoreStatus> {
    return this.http.post<StoreStatus>(`${this.api}/store/open-day`, null);
  }

  products(): Observable<AdminProduct[]> {
    return this.http.get<AdminProduct[]>(`${this.api}/admin/products`);
  }

  createProduct(request: ProductRequest): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(`${this.api}/admin/products`, request);
  }

  updateProduct(id: number, request: ProductRequest): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(`${this.api}/admin/products/${id}`, request);
  }

  uploadProductImage(id: number, file: File): Observable<AdminProduct> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<AdminProduct>(`${this.api}/admin/products/${id}/image`, form);
  }

  removeProductImage(id: number): Observable<AdminProduct> {
    return this.http.delete<AdminProduct>(`${this.api}/admin/products/${id}/image`);
  }

  sectors(): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.api}/admin/sectors`);
  }

  createSector(request: SectorRequest): Observable<Sector> {
    return this.http.post<Sector>(`${this.api}/admin/sectors`, request);
  }

  updateSector(id: number, request: SectorRequest): Observable<Sector> {
    return this.http.put<Sector>(`${this.api}/admin/sectors/${id}`, request);
  }

  paymentAccounts(): Observable<PaymentAccount[]> {
    return this.http.get<PaymentAccount[]>(`${this.api}/admin/payment-accounts`);
  }

  createPaymentAccount(request: PaymentAccountRequest): Observable<PaymentAccount> {
    return this.http.post<PaymentAccount>(`${this.api}/admin/payment-accounts`, request);
  }

  updatePaymentAccount(id: number, request: PaymentAccountRequest): Observable<PaymentAccount> {
    return this.http.put<PaymentAccount>(`${this.api}/admin/payment-accounts/${id}`, request);
  }

  uploadQr(id: number, file: File): Observable<PaymentAccount> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<PaymentAccount>(`${this.api}/admin/payment-accounts/${id}/qr`, form);
  }
}
