import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(UsersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists users including inactive ones', () => {
    service.list().subscribe();
    const req = http.expectOne('/api/users?includeInactive=true');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('creates a staff user', () => {
    const body = { fullName: 'Ana', username: 'ana', email: null, phone: null, password: 'Secret123!', role: 'Cook' as const };
    service.create(body).subscribe();
    const req = http.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('uses the right verbs to deactivate, activate and reset a password', () => {
    service.deactivate(7).subscribe();
    expect(http.expectOne('/api/users/7').request.method).toBe('DELETE');

    service.activate(7).subscribe();
    expect(http.expectOne('/api/users/7/activate').request.method).toBe('POST');

    service.resetPassword(7, 'NewSecret1!').subscribe();
    const reset = http.expectOne('/api/users/7/password');
    expect(reset.request.method).toBe('PUT');
    expect(reset.request.body).toEqual({ newPassword: 'NewSecret1!' });
  });
});
