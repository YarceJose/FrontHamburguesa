import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { BRAND } from '../../../core/config/brand';
import { ROLE_LABELS } from '../../../core/models/user.model';

/** Top bar for signed-in views: brand, current user and sign-out. */
@Component({
  selector: 'app-topbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly brand = BRAND;
  protected readonly user = this.auth.user;
  protected readonly roleLabel = computed(() => {
    const role = this.user()?.role;
    return role ? ROLE_LABELS[role] : '';
  });
  protected readonly initials = computed(() => initialsOf(this.user()?.fullName ?? ''));
}

export function initialsOf(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
