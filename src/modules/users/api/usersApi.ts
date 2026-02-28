import apiClient from '@/lib/api/client';
import type { PaginatedResponse, User } from '@/types';
import type { CreateUserRequest, UpdateUserRequest, UsersQueryParams } from '../types/users.types';

export const usersApi = {
  getAll: (params?: UsersQueryParams) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params }),

  getById: (id: string) => apiClient.get<User>(`/users/${id}`),

  create: (data: CreateUserRequest) => apiClient.post<User>('/users', data),

  update: (id: string, data: UpdateUserRequest) => apiClient.patch<User>(`/users/${id}`, data),

  remove: (id: string) => apiClient.delete<void>(`/users/${id}`),

  resendInvite: (id: string) => apiClient.post<void>(`/users/${id}/resend-invite`),
};
