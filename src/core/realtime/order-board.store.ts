import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { toApiError } from '../api/api-error';
import { AuthService } from '../auth/auth.service';
import { Order } from '../orders/order.model';
import { OrderAction, OrdersService } from '../orders/orders.service';
import { StoreStatus } from '../store/store.model';
import { playChime } from './chime';

export interface StaffNotice {
  id: number;
  kind: 'new' | 'payment' | 'delayed' | 'escalated' | 'info';
  text: string;
  orderCode?: string;
}

/**
 * Live order board for staff views: loads the board once and keeps it current with SignalR
 * (/hubs/orders). Each role only receives the events meant for it.
 * Provide it in the page component so the connection lives while the view is open.
 */
@Injectable()
export class OrderBoardStore {
  private readonly api = inject(OrdersService);
  private readonly auth = inject(AuthService);
  private hub: HubConnection | null = null;
  private noticeId = 0;

  private readonly byId = signal<ReadonlyMap<number, Order>>(new Map());
  readonly orders = computed(() => [...this.byId().values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
  readonly recentFinished = signal<Order[]>([]);
  readonly storeStatus = signal<StoreStatus | null>(null);
  readonly connected = signal(false);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notices = signal<StaffNotice[]>([]);
  readonly busyId = signal<number | null>(null);

  /** Ticks every 30 s so "minutes waiting" labels stay fresh. */
  readonly now = signal(Date.now());

  constructor() {
    const tick = setInterval(() => this.now.set(Date.now()), 30_000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(tick);
      void this.hub?.stop();
    });
  }

  start(): void {
    this.refresh();
    this.api.storeStatus().subscribe((s) => this.storeStatus.set(s));
    void this.connect();
  }

  refresh(): void {
    this.loading.set(true);
    this.api.board().subscribe({
      next: (board) => {
        this.byId.set(new Map(board.active.map((o) => [o.id, o])));
        this.recentFinished.set(board.recentFinished);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err: unknown) => {
        this.error.set(toApiError(err).message);
        this.loading.set(false);
      },
    });
  }

  advance(order: Order, action: OrderAction): void {
    this.run(order, this.api.advance(order.id, action));
  }

  /** Runs a staff action and applies the result right away (the event will confirm it). */
  run(order: Order, request: ReturnType<OrdersService['advance']>): void {
    this.busyId.set(order.id);
    request.subscribe({
      next: (updated) => {
        this.upsert(updated);
        this.busyId.set(null);
      },
      error: (err: unknown) => {
        this.busyId.set(null);
        this.notify('info', toApiError(err).message);
        this.refresh();
      },
    });
  }

  minutesSince(iso: string | null): number {
    return iso ? Math.max(0, Math.floor((this.now() - new Date(iso).getTime()) / 60_000)) : 0;
  }

  dismiss(id: number): void {
    this.notices.update((list) => list.filter((n) => n.id !== id));
  }

  private async connect(): Promise<void> {
    this.hub = new HubConnectionBuilder()
      .withUrl('/hubs/orders', { accessTokenFactory: () => this.auth.token() ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    const role = this.auth.role();
    this.hub.on('orderCreated', (o: Order) => {
      this.upsert(o);
      if (o.status === 'Received') this.notify('new', `Pedido nuevo ${o.code} · ${o.sectorName}`, o.code);
      else if (role === 'Admin') this.notify('info', `Pedido ${o.code} esperando pago por transferencia`, o.code);
    });
    this.hub.on('paymentSubmitted', (o: Order) => {
      this.upsert(o);
      this.notify('payment', `Comprobante recibido del pedido ${o.code}: revísalo`, o.code);
    });
    this.hub.on('orderConfirmed', (o: Order) => {
      this.upsert(o);
      this.notify('new', `Pedido nuevo ${o.code} · ${o.sectorName} (pago aprobado)`, o.code);
    });
    this.hub.on('orderUpdated', (o: Order) => this.upsert(o));
    this.hub.on('orderDelayed', (e: { order: Order; minutesWaiting: number }) => {
      this.upsert(e.order);
      this.notify('delayed', `El pedido ${e.order.code} lleva ${e.minutesWaiting} min y aún no sale`, e.order.code);
    });
    this.hub.on('orderEscalated', (e: { order: Order; minutesWaiting: number }) => {
      this.upsert(e.order);
      this.notify('escalated', `Atención: el pedido ${e.order.code} sigue sin salir (${e.minutesWaiting} min). ¿Qué pasó?`, e.order.code);
    });
    this.hub.on('storeStatus', (s: StoreStatus) => this.storeStatus.set(s));
    this.hub.on('sessionsRevoked', () => this.auth.logout('cierre'));
    // This user was deactivated or got a new password/role: sign out right away
    this.hub.on('sessionRevoked', () => this.auth.logout('sesion'));

    this.hub.onreconnected(() => {
      this.connected.set(true);
      this.refresh(); // catch up on anything missed while offline
    });
    this.hub.onreconnecting(() => this.connected.set(false));
    this.hub.onclose(() => this.connected.set(false));

    try {
      await this.hub.start();
      this.connected.set(this.hub.state === HubConnectionState.Connected);
    } catch {
      this.connected.set(false);
    }
  }

  private upsert(order: Order): void {
    this.byId.update((map) => {
      const next = new Map(map);
      if (order.status === 'Delivered' || order.status === 'Cancelled') {
        next.delete(order.id);
        this.recentFinished.update((list) => [order, ...list.filter((o) => o.id !== order.id)].slice(0, 30));
      } else {
        next.set(order.id, order);
      }
      return next;
    });
  }

  private notify(kind: StaffNotice['kind'], text: string, orderCode?: string): void {
    const notice: StaffNotice = { id: ++this.noticeId, kind, text, orderCode };
    this.notices.update((list) => [notice, ...list].slice(0, 5));
    if (kind !== 'info') playChime(kind === 'delayed' || kind === 'escalated' ? 'alert' : 'new');
    setTimeout(() => this.dismiss(notice.id), kind === 'escalated' || kind === 'delayed' ? 60_000 : 12_000);
  }
}
