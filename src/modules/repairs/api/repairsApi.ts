import apiClient from '@/lib/api/client';
import type { PaginatedResponse, RepairOrder } from '@/types';
import type {
  CreateRepairOrderRequest,
  UpdateRepairOrderRequest,
  ChangeStatusRequest,
  AddCommentRequest,
  RepairOrdersQueryParams,
} from '../types/repairs.types';

export const repairsApi = {
  getAll: (params?: RepairOrdersQueryParams) =>
    apiClient.get<PaginatedResponse<RepairOrder>>('/repair-orders', { params }),

  getById: (id: string) => apiClient.get<RepairOrder>(`/repair-orders/${id}`),

  create: (data: CreateRepairOrderRequest) => apiClient.post<RepairOrder>('/repair-orders', data),

  update: (id: string, data: UpdateRepairOrderRequest) =>
    apiClient.patch<RepairOrder>(`/repair-orders/${id}`, data),

  changeStatus: (id: string, data: ChangeStatusRequest) =>
    apiClient.patch<RepairOrder>(`/repair-orders/${id}/status`, data),

  addComment: (id: string, data: AddCommentRequest) =>
    apiClient.post<{ id: string; message: string; internal: boolean; createdAt: string }>(
      `/repair-orders/${id}/comments`,
      data
    ),

  addImage: (id: string, fileKey: string) =>
    apiClient.post<{ id: string; fileKey: string }>(`/repair-orders/${id}/images`, { fileKey }),

  removeImage: (id: string, imageId: string) =>
    apiClient.delete<void>(`/repair-orders/${id}/images/${imageId}`),
};
