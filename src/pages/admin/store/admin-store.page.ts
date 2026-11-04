import { Component, inject, signal } from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toApiError } from '../../../core/api/api-error';
import { OrdersService } from '../../../core/orders/orders.service';
import { StoreAdminService } from '../../../core/store/store-admin.service';
import { DAYS, DayOfWeek, PaymentAccount, Sector } from '../../../core/store/store.model';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

/** /admin/tienda: schedule, load-based delay, capacity, alerts, delivery sectors and payment accounts (QR). */
@Component({
  selector: 'app-admin-store-page',
  imports: [ReactiveFormsModule, FormsModule, TopbarComponent],
  templateUrl: './admin-store.page.html',
  styleUrl: './admin-store.page.scss',
})
export class AdminStorePage {
  private readonly api = inject(StoreAdminService);
  private readonly orders = inject(OrdersService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly days = DAYS;
  protected readonly saving = signal(false);
  protected readonly message = signal<{ kind: 'ok' | 'error'; text: string } | null>(null);
  protected readonly sectors = signal<Sector[]>([]);
  protected readonly accounts = signal<PaymentAccount[]>([]);
  protected newSector = '';
  protected readonly qrVersion = signal(Date.now());

  protected readonly form = this.fb.group({
    isOpen: [true],
    opensAt: ['16:00', Validators.required],
    closesAt: ['23:00', Validators.required],
    openDays: [[] as DayOfWeek[]],
    basePrepMinutes: [25, [Validators.required, Validators.min(1), Validators.max(240)]],
    ordersBeforeDelay: [5, [Validators.required, Validators.min(1), Validators.max(500)]],
    extraMinutesPerOrder: [5, [Validators.required, Validators.min(0), Validators.max(120)]],
    maxActiveOrders: [20, [Validators.required, Validators.min(0), Validators.max(1000)]],
    alertAfterMinutes: [30, [Validators.required, Validators.min(1), Validators.max(480)]],
    escalateAfterMinutes: [5, [Validators.required, Validators.min(1), Validators.max(240)]],
    paymentTimeoutMinutes: [45, [Validators.required, Validators.min(5), Validators.max(240)]],
  });

  protected readonly accountForm = this.fb.group({
    provider: ['Nequi', Validators.required],
    holderName: ['', [Validators.required, Validators.minLength(2)]],
    accountReference: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor() {
    this.api.settings().subscribe((s) =>
      this.form.reset({ ...s, opensAt: s.opensAt.slice(0, 5), closesAt: s.closesAt.slice(0, 5) }),
    );
    this.loadSectors();
    this.loadAccounts();
  }

  // ---------- Settings ----------
  protected hasDay(day: DayOfWeek): boolean {
    return this.form.controls.openDays.value.includes(day);
  }

  protected toggleDay(day: DayOfWeek): void {
    const current = this.form.controls.openDays.value;
    this.form.controls.openDays.setValue(current.includes(day) ? current.filter((d) => d !== day) : [...current, day]);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.api.saveSettings({ ...v, opensAt: `${v.opensAt}:00`, closesAt: `${v.closesAt}:00` }).subscribe({
      next: () => this.done('Configuración guardada.'),
      error: (err: unknown) => this.fail(err),
    });
  }

  // ---------- Sectors ----------
  protected addSector(): void {
    const name = this.newSector.trim();
    if (name.length < 2) return;
    this.api.createSector({ name, sortOrder: this.sectors().length, isActive: true }).subscribe({
      next: () => {
        this.newSector = '';
        this.loadSectors();
      },
      error: (err: unknown) => this.fail(err),
    });
  }

  protected renameSector(sector: Sector, name: string): void {
    if (name.trim() === sector.name || name.trim().length < 2) return;
    this.api.updateSector(sector.id, { name: name.trim(), sortOrder: sector.sortOrder, isActive: sector.isActive }).subscribe({
      next: () => this.loadSectors(),
      error: (err: unknown) => this.fail(err),
    });
  }

  protected toggleSector(sector: Sector): void {
    this.api.updateSector(sector.id, { name: sector.name, sortOrder: sector.sortOrder, isActive: !sector.isActive }).subscribe({
      next: () => this.loadSectors(),
      error: (err: unknown) => this.fail(err),
    });
  }

  // ---------- Payment accounts ----------
  protected addAccount(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    this.api.createPaymentAccount({ ...this.accountForm.getRawValue(), sortOrder: this.accounts().length, isActive: true }).subscribe({
      next: () => {
        this.accountForm.reset({ provider: 'Nequi', holderName: '', accountReference: '' });
        this.loadAccounts();
      },
      error: (err: unknown) => this.fail(err),
    });
  }

  protected toggleAccount(a: PaymentAccount): void {
    this.api
      .updatePaymentAccount(a.id, { provider: a.provider, holderName: a.holderName, accountReference: a.accountReference, sortOrder: a.sortOrder, isActive: !a.isActive })
      .subscribe({ next: () => this.loadAccounts(), error: (err: unknown) => this.fail(err) });
  }

  protected uploadQr(account: PaymentAccount, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.api.uploadQr(account.id, file).subscribe({
      next: () => {
        this.qrVersion.set(Date.now());
        this.loadAccounts();
        this.done(`QR de ${account.provider} actualizado.`);
      },
      error: (err: unknown) => this.fail(err),
    });
  }

  protected qrUrl(account: PaymentAccount): string {
    return `${this.orders.qrUrl(account.id)}?v=${this.qrVersion()}`;
  }

  private loadSectors(): void {
    this.api.sectors().subscribe((s) => this.sectors.set(s));
  }

  private loadAccounts(): void {
    this.api.paymentAccounts().subscribe((a) => this.accounts.set(a));
  }

  private done(text: string): void {
    this.saving.set(false);
    this.message.set({ kind: 'ok', text });
    setTimeout(() => this.message.set(null), 4000);
  }

  private fail(err: unknown): void {
    this.saving.set(false);
    this.message.set({ kind: 'error', text: toApiError(err).message });
  }
}
