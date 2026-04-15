import apiClient from '@/lib/api/client';
import type { PaginatedResponse, Branch, BranchStatus } from '@/types';
import type { PaginationParams } from '@/types';

export interface CreateBranchRequest {
  name: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
  status?: BranchStatus;
  isMain?: boolean;
  notes?: string;
}

export interface UpdateBranchRequest extends Partial<CreateBranchRequest> {}

export const branchesApi = {
  getAll: (params?: PaginationParams & { status?: BranchStatus }) =>
    apiClient.get<PaginatedResponse<Branch>>('/branches', { params }),

  getById: (id: string) => apiClient.get<Branch>(`/branches/${id}`),

  create: (data: CreateBranchRequest) => apiClient.post<Branch>('/branches', data),

  update: (id: string, data: UpdateBranchRequest) =>
    apiClient.patch<Branch>(`/branches/${id}`, data),

  remove: (id: string) => apiClient.delete<void>(`/branches/${id}`),
};
