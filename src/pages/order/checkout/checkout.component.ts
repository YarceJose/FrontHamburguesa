import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toApiError } from '../../../core/api/api-error';
import { PaymentMethod } from '../../../core/orders/order.model';
import { OrdersService } from '../../../core/orders/orders.service';
import { MenuProduct, Sector } from '../../../core/store/store.model';

export interface CartLine {
  product: MenuProduct;
  quantity: number;
}

const OTHER = 'otro';

/**
 * Order form for customers (no account): who, where (rural sector or "Otro") and how they pay.
 * Cash goes straight to the kitchen; transfer continues on the tracking page with the QR.
 */
@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  private readonly orders = inject(OrdersService);

  readonly lines = input.required<CartLine[]>();
  readonly total = input.required<number>();
  readonly changeQuantity = output<{ productId: number; delta: number }>();
  readonly placed = output<string>();
  readonly cancel = output<void>();

  protected readonly other = OTHER;
  protected readonly sectors = signal<Sector[]>([]);
  protected readonly transferAvailable = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    customerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    customerPhone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{7,20}$/)]],
    sector: ['', Validators.required],
    otherSector: ['', [Validators.maxLength(80)]],
    paymentMethod: ['Cash' as PaymentMethod, Validators.required],
    cashAmount: [null as number | null, [Validators.min(0)]],
  });

  private readonly formValue = signal(this.form.getRawValue());
  protected readonly isOther = computed(() => this.formValue().sector === OTHER);
  protected readonly isCash = computed(() => this.formValue().paymentMethod === 'Cash');
  protected readonly change = computed(() => {
    const cash = this.formValue().cashAmount;
    return cash && cash >= this.total() ? cash - this.total() : null;
  });

  constructor() {
    this.form.valueChanges.subscribe(() => this.formValue.set(this.form.getRawValue()));
    this.orders.sectors().subscribe((s) => this.sectors.set(s));
    this.orders.paymentAccounts().subscribe((a) => this.transferAvailable.set(a.length > 0));
  }

  protected submit(): void {
    const v = this.form.getRawValue();
    if (v.sector === OTHER && !v.otherSector.trim()) {
      this.form.controls.otherSector.setErrors({ required: true });
    }
    if (this.form.invalid || this.lines().length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.orders
      .create({
        customerName: v.customerName.trim(),
        customerPhone: v.customerPhone.trim(),
        sectorId: v.sector === OTHER ? null : Number(v.sector),
        otherSector: v.sector === OTHER ? v.otherSector.trim() : null,
        items: this.lines().map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        paymentMethod: v.paymentMethod,
        cashAmount: v.paymentMethod === 'Cash' ? v.cashAmount : null,
      })
      .subscribe({
        next: (created) => this.placed.emit(created.code),
        error: (err: unknown) => {
          this.error.set(toApiError(err).message);
          this.saving.set(false);
        },
      });
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }
}
