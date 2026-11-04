import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toApiError } from '../../../core/api/api-error';
import { BRAND } from '../../../core/config/brand';
import { OrderStatus, PublicOrder, STATUS_LABELS } from '../../../core/orders/order.model';
import { OrdersService } from '../../../core/orders/orders.service';
import { PaymentAccount } from '../../../core/store/store.model';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'Received', label: 'Recibido' },
  { status: 'Preparing', label: 'En preparación' },
  { status: 'LeftKitchen', label: 'Salió de cocina' },
  { status: 'PickedUp', label: 'En camino' },
  { status: 'Delivered', label: 'Entregado' },
];
const ORDER: OrderStatus[] = ['AwaitingPayment', 'PaymentReview', ...STEPS.map((s) => s.status)];

/** The customer follows the order by its code. Transfer orders show the QR and take the receipt here. */
@Component({
  selector: 'app-track-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './track.page.html',
  styleUrl: './track.page.scss',
})
export class TrackPage {
  private readonly orders = inject(OrdersService);

  /** Route param :code (withComponentInputBinding). */
  readonly code = input.required<string>();

  protected readonly brand = BRAND;
  protected readonly labels = STATUS_LABELS;
  protected readonly steps = STEPS;
  protected readonly order = signal<PublicOrder | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly accounts = signal<PaymentAccount[]>([]);
  protected readonly uploading = signal(false);
  protected readonly uploadError = signal<string | null>(null);
  protected readonly copied = signal<string | null>(null);

  protected readonly needsPayment = computed(() => this.order()?.status === 'AwaitingPayment');
  protected readonly stepIndex = computed(() => {
    const status = this.order()?.status;
    return status ? ORDER.indexOf(status) - 2 : -1;
  });

  constructor() {
    effect(() => this.load(this.code()));
    // Refresh every 15 s until the order is finished
    const timer = setInterval(() => {
      const status = this.order()?.status;
      if (status && status !== 'Delivered' && status !== 'Cancelled') this.load(this.code());
    }, 15_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
    this.orders.paymentAccounts().subscribe((a) => this.accounts.set(a));
  }

  protected qrUrl(account: PaymentAccount): string {
    return this.orders.qrUrl(account.id);
  }

  protected async copy(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
    this.copied.set(text);
    setTimeout(() => this.copied.set(null), 2000);
  }

  protected upload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError.set('El archivo pesa más de 5 MB.');
      return;
    }

    this.uploading.set(true);
    this.uploadError.set(null);
    this.orders.uploadReceipt(this.code(), file).subscribe({
      next: (order) => {
        this.order.set(order);
        this.uploading.set(false);
      },
      error: (err: unknown) => {
        this.uploadError.set(toApiError(err).message);
        this.uploading.set(false);
      },
    });
  }

  private load(code: string): void {
    this.orders.track(code).subscribe({
      next: (order) => {
        this.order.set(order);
        this.error.set(null);
      },
      error: (err: unknown) => this.error.set(toApiError(err).message),
    });
  }
}
