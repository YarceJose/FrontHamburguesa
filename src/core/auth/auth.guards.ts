import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/user.model';
import { AuthService } from './auth.service';

/** Only the given roles. Signed-in users with another role go to their own view; anyone else to the sign-in. */
export const roleGuard =
  (...roles: UserRole[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const role = auth.role();
    if (role && roles.includes(role)) return true;
    return role
      ? inject(Router).createUrlTree([auth.homeUrl(role)])
      : inject(Router).createUrlTree(['/'], { queryParams: { admin: 'true' } });
  };
