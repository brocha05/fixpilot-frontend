import apiClient from '@/lib/api/client';
import type { FileRecord, PaginatedResponse } from '@/types';

export const filesApi = {
  upload: (file: File, resourceType?: string, resourceId?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (resourceType) form.append('resourceType', resourceType);
    if (resourceId) form.append('resourceId', resourceId);
    return apiClient.post<FileRecord>('/files', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getAll: (params?: {
    resourceType?: string;
    resourceId?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get<PaginatedResponse<FileRecord>>('/files', { params }),

  getById: (id: string) => apiClient.get<FileRecord>(`/files/${id}`),

  getDownloadUrl: (id: string, expiresIn?: number) =>
    apiClient.get<{ url: string }>(`/files/${id}/download`, {
      params: expiresIn ? { expiresIn } : undefined,
    }),

  delete: (id: string) => apiClient.delete<void>(`/files/${id}`),
};
