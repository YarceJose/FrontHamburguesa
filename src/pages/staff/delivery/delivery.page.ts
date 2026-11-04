import { Component, computed, inject } from '@angular/core';
import { OrderBoardStore } from '../../../core/realtime/order-board.store';
import { LiveNoticesComponent } from '../../../shared/components/live-notices/live-notices.component';
import { OrderTicketComponent } from '../../../shared/components/order-ticket/order-ticket.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

/** /domicilios: orders ready to pick up and on the way. */
@Component({
  selector: 'app-delivery-page',
  imports: [TopbarComponent, OrderTicketComponent, LiveNoticesComponent],
  providers: [OrderBoardStore],
  templateUrl: './delivery.page.html',
  styleUrl: '../staff-board.scss',
})
export class DeliveryPage {
  protected readonly board = inject(OrderBoardStore);
  protected readonly ready = computed(() => this.board.orders().filter((o) => o.status === 'LeftKitchen'));
  protected readonly onTheWay = computed(() => this.board.orders().filter((o) => o.status === 'PickedUp'));
  protected readonly inKitchen = computed(() => this.board.orders().filter((o) => o.status === 'Received' || o.status === 'Preparing').length);

  constructor() {
    this.board.start();
  }
}
