import apiClient from '@/lib/api/client';
import type { PaginatedResponse, CompanyWithDetails, Subscription, Plan } from '@/types';

export interface CreatePlanRequest {
  name: string;
  slug: string;
  stripePriceId: string;
  stripeProductId: string;
  interval: 'MONTH' | 'YEAR';
  price: number;
  currency: string;
  features: string[];
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}

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

  // ── Plan management ────────────────────────────────────────────────────────
  getAllPlans: () => apiClient.get<Plan[]>('/subscriptions/plans/all'),

  createPlan: (data: CreatePlanRequest) => apiClient.post<Plan>('/subscriptions/plans', data),

  updatePlan: (id: string, data: UpdatePlanRequest) =>
    apiClient.patch<Plan>(`/subscriptions/plans/${id}`, data),

  deactivatePlan: (id: string) =>
    apiClient.patch<{ message: string }>(`/subscriptions/plans/${id}/deactivate`),

  activatePlan: (id: string) =>
    apiClient.patch<{ message: string }>(`/subscriptions/plans/${id}/activate`),
};
