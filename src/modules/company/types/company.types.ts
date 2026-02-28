import type { Company, UserRole } from '@/types';

export type { Company };

export interface UpdateCompanyRequest {
  name?: string;
}

export interface InviteUserRequest {
  email: string;
  role: Extract<UserRole, 'ADMIN' | 'MEMBER'>;
}
