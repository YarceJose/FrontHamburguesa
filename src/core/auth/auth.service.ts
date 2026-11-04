import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Credentials, LoginResponse, User, UserRole } from '../models/user.model';

interface Session {
  token: string;
  expiresAt: string;
  user: User;
}

/**
 * localStorage: a kitchen or delivery session survives closing the tab and only ends when
 * the admin presses "Cerrar jornada" (the API rejects the token and we sign out).
 */
const STORAGE_KEY = 'bh.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly session = signal<Session | null>(this.restore());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly role = computed<UserRole | null>(() => this.user()?.role ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly isAdmin = computed(() => this.role() === 'Admin');

  /** Every staff member signs in with username and password. */
  login(credentials: Credentials): Observable<User> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap((res) => this.store(res)), map((res) => res.user));
  }

  /** Clears the session and goes back to the sign-in. `reason` is shown there (e.g. the day was closed). */
  logout(reason?: string): void {
    this.session.set(null);
    localStorage.removeItem(STORAGE_KEY);
    void this.router.navigate(['/'], { queryParams: reason ? { admin: 'true', motivo: reason } : { admin: 'true' } });
  }

  /** Drops the session without navigating (e.g. signed in at the wrong entry point). */
  forget(): void {
    this.session.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  /** Each role has its own view. */
  homeUrl(role: UserRole | null = this.role()): string {
    switch (role) {
      case 'Admin':
        return '/admin';
      case 'Cook':
        return '/cocina';
      case 'Delivery':
        return '/domicilios';
      default:
        return '/';
    }
  }

  private store(res: LoginResponse): void {
    const session: Session = { token: res.token, expiresAt: res.expiresAt, user: res.user };
    this.session.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private restore(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as Session;
      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }
}
