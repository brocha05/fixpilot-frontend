'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi, type CreateProductRequest, type UpdateProductRequest, type ListProductsParams } from '../api/inventoryApi';
import { toastApiError } from '@/lib/utils/apiError';

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params: ListProductsParams) => [...inventoryKeys.lists(), params] as const,
  detail: (id: string) => [...inventoryKeys.all, 'detail', id] as const,
};

export function useProducts(params?: ListProductsParams) {
  return useQuery({
    queryKey: inventoryKeys.list(params ?? {}),
    queryFn: () => inventoryApi.list(params).then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductRequest) => inventoryApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success('Producto creado correctamente');
    },
    onError: (err: unknown) => toastApiError(err, 'Error al crear el producto'),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      inventoryApi.update(id, data).then((r) => r.data),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.lists() });
      qc.invalidateQueries({ queryKey: inventoryKeys.detail(product.id) });
      toast.success('Producto actualizado correctamente');
    },
    onError: (err: unknown) => toastApiError(err, 'Error al actualizar el producto'),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success('Producto eliminado correctamente');
    },
    onError: (err: unknown) => toastApiError(err, 'Error al eliminar el producto'),
  });
}
