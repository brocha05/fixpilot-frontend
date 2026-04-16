'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { salesApi, type CreateSaleRequest, type ListSalesParams } from '../api/salesApi';
import { toastApiError } from '@/lib/utils/apiError';
import { analyticsKeys } from '@/modules/analytics/hooks/useAnalytics';

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (params: ListSalesParams) => [...saleKeys.lists(), params] as const,
  detail: (id: string) => [...saleKeys.all, 'detail', id] as const,
};

export function useSales(params?: ListSalesParams) {
  return useQuery({
    queryKey: saleKeys.list(params ?? {}),
    queryFn: () => salesApi.list(params).then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => salesApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSaleRequest) => salesApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: saleKeys.lists() });
      // Refresh analytics + inventory (stock changed)
      qc.invalidateQueries({ queryKey: analyticsKeys.summary() });
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Venta registrada correctamente');
    },
    onError: (err: unknown) => toastApiError(err, 'Error al registrar la venta'),
  });
}

export function useCancelSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesApi.cancel(id).then((r) => r.data),
    onSuccess: (sale) => {
      qc.invalidateQueries({ queryKey: saleKeys.lists() });
      qc.invalidateQueries({ queryKey: saleKeys.detail(sale.id) });
      qc.invalidateQueries({ queryKey: analyticsKeys.summary() });
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Venta cancelada. Stock restaurado.');
    },
    onError: (err: unknown) => toastApiError(err, 'Error al cancelar la venta'),
  });
}
