import apiClient from '@/lib/api/client';
import type { Product, ProductStatus } from '@/types';

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  price: number;
  cost?: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  status?: ProductStatus;
  branchId?: string;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  lowStock?: boolean;
  category?: string;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const inventoryApi = {
  list: (params?: ListProductsParams) =>
    apiClient.get<ProductListResponse>('/inventory', { params }),

  get: (id: string) => apiClient.get<Product>(`/inventory/${id}`),

  create: (data: CreateProductRequest) =>
    apiClient.post<Product>('/inventory', data),

  update: (id: string, data: UpdateProductRequest) =>
    apiClient.patch<Product>(`/inventory/${id}`, data),

  remove: (id: string) => apiClient.delete<void>(`/inventory/${id}`),
};
