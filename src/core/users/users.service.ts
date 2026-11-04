import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateStaffUserRequest, User } from '../models/user.model';

/** Admin-only user management (API: /api/users). */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  /** Every user, active or not; the panel filters on the client. */
  list(): Observable<User[]> {
    const params = new HttpParams().set('includeInactive', true);
    return this.http.get<User[]>(this.baseUrl, { params });
  }

  create(request: CreateStaffUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, request);
  }

  resetPassword(id: number, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/password`, { newPassword });
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activate(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/activate`, null);
  }
}
