import apiClient from '@/lib/api/client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';
import type { User } from '@/types';

export const authApi = {
  login: (data: LoginRequest) => apiClient.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) => apiClient.post<AuthResponse>('/auth/register', data),

  logout: () => apiClient.post<void>('/auth/logout'),

  getMe: () => apiClient.get<User>('/auth/me'),

  refreshToken: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    }),

  forgotPassword: (email: string) => apiClient.post<void>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<void>('/auth/reset-password', { token, password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<void>('/auth/change-password', { currentPassword, newPassword }),

  acceptInvite: (token: string, firstName: string, lastName: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/accept-invite', { token, firstName, lastName, password }),
};
