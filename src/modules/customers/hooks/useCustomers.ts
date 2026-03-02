'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { customersApi, CreateCustomerRequest, UpdateCustomerRequest } from '../api/customersApi';
import { toastApiError } from '@/lib/utils/apiError';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

export function useCustomers(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: customerKeys.list(params ?? {}),
    queryFn: () => customersApi.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customersApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success('Cliente registrado exitosamente.');
    },
    onError: (error: unknown) => toastApiError(error, 'Error al registrar el cliente.'),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      customersApi.update(id, data).then((r) => r.data),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.setQueryData(customerKeys.detail(customer.id), customer);
      toast.success('Cliente actualizado.');
    },
    onError: (error: unknown) => toastApiError(error, 'Error al actualizar el cliente.'),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success('Cliente eliminado.');
    },
    onError: (error: unknown) =>
      toastApiError(error, 'No se puede eliminar un cliente con órdenes activas.'),
  });
}
