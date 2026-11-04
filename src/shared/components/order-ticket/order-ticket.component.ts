import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Order, STATUS_LABELS } from '../../../core/orders/order.model';

/** Order card for staff boards. Actions are projected by each view (kitchen, delivery, admin). */
@Component({
  selector: 'app-order-ticket',
  imports: [CurrencyPipe],
  templateUrl: './order-ticket.component.html',
  styleUrl: './order-ticket.component.scss',
})
export class OrderTicketComponent {
  readonly order = input.required<Order>();
  /** Minutes since the order entered the kitchen (or was created, while unpaid). */
  readonly minutes = input(0);
  readonly showCustomer = input(true);

  protected readonly labels = STATUS_LABELS;
  protected readonly late = computed(() => this.order().delayAlertSent);
  protected readonly change = computed(() => {
    const o = this.order();
    return o.paymentMethod === 'Cash' && o.cashAmount ? o.cashAmount - o.total : null;
  });
}
