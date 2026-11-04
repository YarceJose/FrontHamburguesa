import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { toApiError } from '../../../core/api/api-error';
import { AuthService } from '../../../core/auth/auth.service';
import { ROLE_LABELS, User, UserRole } from '../../../core/models/user.model';
import { UsersService } from '../../../core/users/users.service';
import { SidePanelComponent } from '../../../shared/components/side-panel/side-panel.component';
import { initialsOf, TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { PasswordFormComponent } from './password-form/password-form.component';
import { UserFormComponent } from './user-form/user-form.component';

type RoleFilter = UserRole | 'all';
type StatusFilter = 'active' | 'inactive' | 'all';
type Panel = { kind: 'create' } | { kind: 'password'; user: User } | null;
interface Toast {
  kind: 'success' | 'error';
  text: string;
}

const ROLE_ORDER: UserRole[] = ['Admin', 'Cook', 'Delivery'];
const ROLE_PLURALS: Record<UserRole, string> = {
  Admin: 'Administradores',
  Cook: 'Cocina',
  Delivery: 'Domiciliarios',
};

/** Admin users panel: who exists, and staff management (create Cook/Delivery, passwords, activation). */
@Component({
  selector: 'app-admin-users-page',
  imports: [DatePipe, TopbarComponent, SidePanelComponent, UserFormComponent, PasswordFormComponent],
  templateUrl: './admin-users.page.html',
  styleUrl: './admin-users.page.scss',
})
export class AdminUsersPage {
  private readonly usersApi = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);
  private toastTimer?: ReturnType<typeof setTimeout>;

  protected readonly roleLabels = ROLE_LABELS;
  protected readonly rolePlurals = ROLE_PLURALS;
  protected readonly roles = ROLE_ORDER;
  private readonly auth = inject(AuthService);
  protected readonly currentUserId = computed(() => this.auth.user()?.id);

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  protected readonly roleFilter = signal<RoleFilter>('all');
  protected readonly statusFilter = signal<StatusFilter>('active');
  protected readonly search = signal('');

  protected readonly panel = signal<Panel>(null);
  protected readonly confirmingId = signal<number | null>(null);
  protected readonly busyId = signal<number | null>(null);
  protected readonly toast = signal<Toast | null>(null);

  /** Active users per role, for the summary cards and chip counters. */
  protected readonly counts = computed(() => {
    const active = this.users().filter((u) => u.isActive);
    const byRole = (role: UserRole) => active.filter((u) => u.role === role).length;
    return {
      all: active.length,
      Admin: byRole('Admin'),
      Cook: byRole('Cook'),
      Delivery: byRole('Delivery'),
      inactive: this.users().length - active.length,
    };
  });

  protected readonly visibleUsers = computed(() => {
    const role = this.roleFilter();
    const status = this.statusFilter();
    const term = normalize(this.search());

    return this.users()
      .filter((u) => role === 'all' || u.role === role)
      .filter((u) => status === 'all' || u.isActive === (status === 'active'))
      .filter((u) => !term || normalize(`${u.fullName} ${u.email ?? ''} ${u.phone ?? ''}`).includes(term))
      .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) || a.fullName.localeCompare(b.fullName));
  });

  constructor() {
    this.load();
    this.destroyRef.onDestroy(() => clearTimeout(this.toastTimer));
  }

  protected load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.usersApi.list().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loadError.set(toApiError(err).message);
        this.loading.set(false);
      },
    });
  }

  protected initials(user: User): string {
    return initialsOf(user.fullName);
  }

  protected isSelf(user: User): boolean {
    return user.id === this.currentUserId();
  }

  // ---------- Panels ----------
  protected openCreate(): void {
    this.panel.set({ kind: 'create' });
  }

  protected openPassword(user: User): void {
    this.panel.set({ kind: 'password', user });
  }

  protected closePanel(): void {
    this.panel.set(null);
  }

  protected onCreated(user: User): void {
    this.users.update((list) => [user, ...list]);
    this.closePanel();
    this.roleFilter.set('all');
    this.statusFilter.set('active');
    this.showToast('success', `${user.fullName} ya puede ingresar como ${ROLE_LABELS[user.role].toLowerCase()}.`);
  }

  protected onPasswordReset(user: User): void {
    this.closePanel();
    this.showToast('success', `Contraseña de ${user.fullName} actualizada.`);
  }

  // ---------- Activation ----------
  protected deactivate(user: User): void {
    this.confirmingId.set(null);
    this.busyId.set(user.id);
    this.usersApi.deactivate(user.id).subscribe({
      next: () => this.markActive(user, false, `${user.fullName} fue desactivado.`),
      error: (err: unknown) => this.fail(err),
    });
  }

  protected activate(user: User): void {
    this.busyId.set(user.id);
    this.usersApi.activate(user.id).subscribe({
      next: () => this.markActive(user, true, `${user.fullName} fue activado.`),
      error: (err: unknown) => this.fail(err),
    });
  }

  private markActive(user: User, isActive: boolean, message: string): void {
    this.users.update((list) => list.map((u) => (u.id === user.id ? { ...u, isActive } : u)));
    this.busyId.set(null);
    this.showToast('success', message);
  }

  private fail(err: unknown): void {
    this.busyId.set(null);
    this.showToast('error', toApiError(err).message);
  }

  private showToast(kind: Toast['kind'], text: string): void {
    clearTimeout(this.toastTimer);
    this.toast.set({ kind, text });
    this.toastTimer = setTimeout(() => this.toast.set(null), 4500);
  }
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}
