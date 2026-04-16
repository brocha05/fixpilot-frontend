import apiClient from '@/lib/api/client';
import type { Sale, SaleStatus, PaymentMethod } from '@/types';

export interface SaleItemInput {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateSaleRequest {
  items: SaleItemInput[];
  paymentMethod: PaymentMethod;
  discount?: number;
  customerId?: string;
  branchId?: string;
  notes?: string;
}

export interface ListSalesParams {
  page?: number;
  limit?: number;
  status?: SaleStatus;
  paymentMethod?: PaymentMethod;
}

export interface SaleListResponse {
  data: Sale[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const salesApi = {
  list: (params?: ListSalesParams) =>
    apiClient.get<SaleListResponse>('/sales', { params }),

  get: (id: string) => apiClient.get<Sale>(`/sales/${id}`),

  create: (data: CreateSaleRequest) =>
    apiClient.post<Sale>('/sales', data),

  cancel: (id: string) => apiClient.patch<Sale>(`/sales/${id}/cancel`, {}),
};
