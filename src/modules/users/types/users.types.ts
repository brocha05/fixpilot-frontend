import type { User, UserRole, PaginationParams } from '@/types';

export type { User, UserRole };

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UsersQueryParams extends PaginationParams {
  role?: UserRole;
  isActive?: boolean;
}
