'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { filesApi } from '../api/filesApi';

export const fileKeys = {
  all: ['files'] as const,
  list: (params?: object) => [...fileKeys.all, 'list', params] as const,
  detail: (id: string) => [...fileKeys.all, id] as const,
};

export function useFiles(params?: {
  resourceType?: string;
  resourceId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: fileKeys.list(params),
    queryFn: () => filesApi.getAll(params).then((r) => r.data),
  });
}

export function useFile(id: string) {
  return useQuery({
    queryKey: fileKeys.detail(id),
    queryFn: () => filesApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      resourceType,
      resourceId,
    }: {
      file: File;
      resourceType?: string;
      resourceId?: string;
    }) => filesApi.upload(file, resourceType, resourceId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
      toast.success('File uploaded.');
    },
    onError: () => toast.error('Failed to upload file.'),
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
      toast.success('File deleted.');
    },
    onError: () => toast.error('Failed to delete file.'),
  });
}

export function useFileDownloadUrl(id: string) {
  return useQuery({
    queryKey: [...fileKeys.detail(id), 'download'],
    queryFn: () => filesApi.getDownloadUrl(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 60_000 * 10, // URLs are valid for 15min, refresh at 10min
  });
}
