import apiClient from '@/lib/api/client';
import type { PaginatedResponse, Customer } from '@/types';
import type { PaginationParams } from '@/types';

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

export const customersApi = {
  getAll: (params?: PaginationParams & { search?: string }) =>
    apiClient.get<PaginatedResponse<Customer>>('/customers', { params }),

  getById: (id: string) => apiClient.get<Customer>(`/customers/${id}`),

  create: (data: CreateCustomerRequest) => apiClient.post<Customer>('/customers', data),

  update: (id: string, data: UpdateCustomerRequest) =>
    apiClient.patch<Customer>(`/customers/${id}`, data),

  remove: (id: string) => apiClient.delete<void>(`/customers/${id}`),
};
