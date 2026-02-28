import apiClient from '@/lib/api/client';
import type { PaginatedResponse, CompanyWithDetails, Subscription } from '@/types';

export const adminApi = {
  getCompanies: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<PaginatedResponse<CompanyWithDetails>>('/admin/companies', { params }),

  getCompany: (id: string) => apiClient.get<CompanyWithDetails>(`/admin/companies/${id}`),

  deactivateCompany: (id: string) =>
    apiClient.patch<CompanyWithDetails>(`/admin/companies/${id}/deactivate`),

  reactivateCompany: (id: string) =>
    apiClient.patch<CompanyWithDetails>(`/admin/companies/${id}/reactivate`),

  getSubscriptions: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Subscription>>('/admin/subscriptions', { params }),
};
