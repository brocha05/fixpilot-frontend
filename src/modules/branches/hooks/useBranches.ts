'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { branchesApi, type CreateBranchRequest, type UpdateBranchRequest } from '../api/branchesApi';
import { toastApiError } from '@/lib/utils/apiError';
import type { BranchStatus } from '@/types';

export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...branchKeys.lists(), params] as const,
  details: () => [...branchKeys.all, 'detail'] as const,
  detail: (id: string) => [...branchKeys.details(), id] as const,
};

export function useBranches(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: BranchStatus;
}) {
  return useQuery({
    queryKey: branchKeys.list(params ?? {}),
    queryFn: () => branchesApi.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useBranch(id: string) {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => branchesApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBranchRequest) => branchesApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      toast.success('Sucursal registrada exitosamente.');
    },
    onError: (error: unknown) => toastApiError(error, 'Error al registrar la sucursal.'),
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchRequest }) =>
      branchesApi.update(id, data).then((r) => r.data),
    onSuccess: (branch) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.setQueryData(branchKeys.detail(branch.id), branch);
      toast.success('Sucursal actualizada.');
    },
    onError: (error: unknown) => toastApiError(error, 'Error al actualizar la sucursal.'),
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      toast.success('Sucursal eliminada.');
    },
    onError: (error: unknown) =>
      toastApiError(error, 'No se puede eliminar una sucursal con órdenes activas.'),
  });
}
