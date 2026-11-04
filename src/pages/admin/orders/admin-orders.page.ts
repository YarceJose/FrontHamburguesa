import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { toApiError } from '../../../core/api/api-error';
import { Order, STATUS_LABELS } from '../../../core/orders/order.model';
import { OrdersService } from '../../../core/orders/orders.service';
import { OrderBoardStore } from '../../../core/realtime/order-board.store';
import { StoreAdminService } from '../../../core/store/store-admin.service';
import { LiveNoticesComponent } from '../../../shared/components/live-notices/live-notices.component';
import { OrderTicketComponent } from '../../../shared/components/order-ticket/order-ticket.component';
import { SidePanelComponent } from '../../../shared/components/side-panel/side-panel.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

/** /admin: every open order, transfer receipts to check, store open/closed and "Cerrar jornada". */
@Component({
  selector: 'app-admin-orders-page',
  imports: [CurrencyPipe, DatePipe, TopbarComponent, OrderTicketComponent, LiveNoticesComponent, SidePanelComponent],
  providers: [OrderBoardStore],
  templateUrl: './admin-orders.page.html',
  styleUrls: ['../../staff/staff-board.scss', './admin-orders.page.scss'],
})
export class AdminOrdersPage {
  protected readonly board = inject(OrderBoardStore);
  private readonly orders = inject(OrdersService);
  private readonly store = inject(StoreAdminService);

  protected readonly labels = STATUS_LABELS;
  protected readonly review = computed(() => this.board.orders().filter((o) => o.status === 'PaymentReview'));
  protected readonly awaiting = computed(() => this.board.orders().filter((o) => o.status === 'AwaitingPayment'));
  protected readonly kitchen = computed(() => this.board.orders().filter((o) => o.status === 'Received' || o.status === 'Preparing'));
  protected readonly dispatch = computed(() => this.board.orders().filter((o) => o.status === 'LeftKitchen' || o.status === 'PickedUp'));

  protected readonly receiptOrder = signal<Order | null>(null);
  protected readonly receiptUrl = signal<string | null>(null);
  protected readonly receiptIsPdf = signal(false);
  protected readonly rejectingId = signal<number | null>(null);
  protected readonly confirmClose = signal(false);
  protected readonly dayBusy = signal(false);

  constructor() {
    this.board.start();
    inject(DestroyRef).onDestroy(() => this.revokeReceipt());
  }

  protected minutes(order: Order): number {
    return this.board.minutesSince(order.receivedAt ?? order.createdAt);
  }

  protected openReceipt(order: Order): void {
    this.revokeReceipt();
    this.receiptOrder.set(order);
    this.orders.receipt(order.id).subscribe({
      next: (blob) => {
        this.receiptIsPdf.set(blob.type === 'application/pdf');
        this.receiptUrl.set(URL.createObjectURL(blob));
      },
      error: (err: unknown) => alert(toApiError(err).message),
    });
  }

  protected closeReceipt(): void {
    this.receiptOrder.set(null);
    this.rejectingId.set(null);
    this.revokeReceipt();
  }

  protected approve(order: Order): void {
    this.board.run(order, this.orders.approvePayment(order.id));
    this.closeReceipt();
  }

  protected reject(order: Order, reason: string): void {
    if (reason.trim().length < 3) return;
    this.board.run(order, this.orders.rejectPayment(order.id, reason.trim()));
    this.closeReceipt();
  }

  protected cancel(order: Order): void {
    const reason = prompt(`¿Cancelar el pedido ${order.code}? Escribe el motivo:`);
    if (reason === null) return;
    this.board.run(order, this.orders.cancel(order.id, reason || null));
  }

  protected toggleDay(): void {
    const open = this.board.storeStatus()?.isOpen;
    if (open && !this.confirmClose()) {
      this.confirmClose.set(true);
      return;
    }
    this.dayBusy.set(true);
    (open ? this.store.closeDay() : this.store.openDay()).subscribe({
      next: (status) => {
        this.board.storeStatus.set(status);
        this.confirmClose.set(false);
        this.dayBusy.set(false);
      },
      error: () => this.dayBusy.set(false),
    });
  }

  private revokeReceipt(): void {
    const url = this.receiptUrl();
    if (url) URL.revokeObjectURL(url);
    this.receiptUrl.set(null);
  }
}
