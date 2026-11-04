import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/** The sign-in endpoint never carries a JWT, and its 401 means "wrong credentials", not "session ended". */
const LOGIN_ENDPOINT = /\/auth\/login$/;

/** Adds the JWT to API calls and signs out when the API says the session ended (e.g. "Cerrar jornada"). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const isLogin = LOGIN_ENDPOINT.test(req.url);
  const request =
    token && req.url.startsWith(environment.apiUrl) && !isLogin
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && token && !isLogin) {
        auth.logout('sesion');
      }
      return throwError(() => error);
    }),
  );
};
