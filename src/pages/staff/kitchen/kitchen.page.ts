import { Component, computed, inject } from '@angular/core';
import { OrderBoardStore } from '../../../core/realtime/order-board.store';
import { LiveNoticesComponent } from '../../../shared/components/live-notices/live-notices.component';
import { OrderTicketComponent } from '../../../shared/components/order-ticket/order-ticket.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

/** /cocina: confirmed orders to prepare. New orders and delays arrive live with a soft sound. */
@Component({
  selector: 'app-kitchen-page',
  imports: [TopbarComponent, OrderTicketComponent, LiveNoticesComponent],
  providers: [OrderBoardStore],
  templateUrl: './kitchen.page.html',
  styleUrl: '../staff-board.scss',
})
export class KitchenPage {
  protected readonly board = inject(OrderBoardStore);
  protected readonly toPrepare = computed(() => this.board.orders().filter((o) => o.status === 'Received'));
  protected readonly preparing = computed(() => this.board.orders().filter((o) => o.status === 'Preparing'));

  constructor() {
    this.board.start();
  }
}
