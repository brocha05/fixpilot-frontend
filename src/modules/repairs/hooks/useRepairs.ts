'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { repairsApi } from '../api/repairsApi';
import { toastApiError } from '@/lib/utils/apiError';
import type {
  RepairOrdersQueryParams,
  ChangeStatusRequest,
  AddCommentRequest,
  UpdateRepairOrderRequest,
  CreateRepairOrderRequest,
} from '../types/repairs.types';

export const repairKeys = {
  all: ['repair-orders'] as const,
  lists: () => [...repairKeys.all, 'list'] as const,
  list: (params: RepairOrdersQueryParams) => [...repairKeys.lists(), params] as const,
  details: () => [...repairKeys.all, 'detail'] as const,
  detail: (id: string) => [...repairKeys.details(), id] as const,
};

export function useRepairOrders(params?: RepairOrdersQueryParams) {
  return useQuery({
    queryKey: repairKeys.list(params ?? {}),
    queryFn: () => repairsApi.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useRepairOrder(id: string) {
  return useQuery({
    queryKey: repairKeys.detail(id),
    queryFn: () => repairsApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateRepairOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRepairOrderRequest) => repairsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repairKeys.lists() });
      toast.success('Orden de reparación creada exitosamente.');
    },
    onError: (error: unknown) => toastApiError(error, 'Error al crear la orden.'),
  });
}

export function useUpdateRepairOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRepairOrderRequest }) =>
      repairsApi.update(id, data).then((r) => r.data),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: repairKeys.lists() });
      queryClient.setQueryData(repairKeys.detail(order.id), order);
      toast.success('Orden actualizada.');
    },
    onError: (error: unknown) => toastApiError(error, 'Error al actualizar la orden.'),
  });
}

export function useChangeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeStatusRequest }) =>
      repairsApi.changeStatus(id, data).then((r) => r.data),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: repairKeys.lists() });
      queryClient.setQueryData(repairKeys.detail(order.id), order);
      toast.success('Estado actualizado correctamente.');
    },
    onError: (error: unknown) => toastApiError(error, 'Transición de estado no permitida.'),
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddCommentRequest }) =>
      repairsApi.addComment(id, data).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: repairKeys.detail(id) });
      toast.success('Comentario agregado.');
    },
    onError: () => toast.error('Error al agregar el comentario.'),
  });
}
