import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { User } from '../../../core/models/user.model';
import { AdminUsersPage } from './admin-users.page';

const user = (id: number, fullName: string, role: User['role'], isActive = true): User => ({
  id,
  fullName,
  username: null,
  email: `${id}@test.local`,
  phone: null,
  role,
  isActive,
  createdAt: '2026-11-04T00:00:00Z',
  updatedAt: '2026-11-04T00:00:00Z',
  lastLoginAt: null,
});

describe('AdminUsersPage', () => {
  it('loads users, counts active ones and filters by role, status and search', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminUsersPage);
    const page = fixture.componentInstance as unknown as {
      counts: () => Record<string, number>;
      visibleUsers: () => User[];
      roleFilter: { set: (v: string) => void };
      statusFilter: { set: (v: string) => void };
      search: { set: (v: string) => void };
    };

    TestBed.inject(HttpTestingController)
      .expectOne('/api/users?includeInactive=true')
      .flush([
        user(1, 'Admin', 'Admin'),
        user(2, 'Laura Peña', 'Cook'),
        user(3, 'Dani', 'Delivery'),
        user(4, 'Old Cook', 'Cook', false),
      ]);

    expect(page.counts()['all']).toBe(3);
    expect(page.counts()['Cook']).toBe(1);
    expect(page.counts()['inactive']).toBe(1);

    page.roleFilter.set('Cook');
    expect(page.visibleUsers().map((u) => u.id)).toEqual([2]);

    page.statusFilter.set('all');
    expect(page.visibleUsers().map((u) => u.id)).toEqual([2, 4]);

    page.search.set('pena'); // accent-insensitive
    expect(page.visibleUsers().map((u) => u.id)).toEqual([2]);
  });
});
