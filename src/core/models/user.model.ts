/** People who sign in. Customers are not users: their data lives in each order. */
export type UserRole = 'Admin' | 'Cook' | 'Delivery';

/** Roles an Admin can create from the panel. */
export type StaffRole = Extract<UserRole, 'Cook' | 'Delivery'>;

export interface User {
  id: number;
  fullName: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  Admin: 'Administrador',
  Cook: 'Cocina',
  Delivery: 'Domiciliario',
};

export interface CreateStaffUserRequest {
  fullName: string;
  username: string;
  email: string | null;
  phone: string | null;
  password: string;
  role: StaffRole;
}
