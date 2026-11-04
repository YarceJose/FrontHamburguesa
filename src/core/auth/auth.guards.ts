import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/user.model';
import { AuthService } from './auth.service';

/** Only the given roles; anyone else goes to their own view (or to sign-in). */
export const roleGuard =
  (...roles: UserRole[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const role = auth.role();
    if (role && roles.includes(role)) return true;
    return inject(Router).createUrlTree([role ? auth.homeUrl(role) : '/personal']);
  };

/** Staff sign-in page: someone already signed in goes to their view. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return !auth.isAuthenticated() || inject(Router).createUrlTree([auth.homeUrl()]);
};
