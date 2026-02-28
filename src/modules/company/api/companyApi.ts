import apiClient from '@/lib/api/client';
import type { Company, User } from '@/types';
import type { UpdateCompanyRequest, InviteUserRequest } from '../types/company.types';

export const companyApi = {
  getCurrent: () => apiClient.get<Company>('/companies/me'),

  update: (data: UpdateCompanyRequest) => apiClient.patch<Company>('/companies/me', data),

  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('logo', file);
    return apiClient.post<{ url: string }>('/companies/me/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getMembers: () => apiClient.get<User[]>('/companies/me/members'),

  inviteUser: (data: InviteUserRequest) => apiClient.post<void>('/companies/me/invite', data),

  changePlan: (planId: string) => apiClient.post<void>(`/companies/me/change-plan/${planId}`),

  delete: () => apiClient.delete<void>('/companies/me'),
};
