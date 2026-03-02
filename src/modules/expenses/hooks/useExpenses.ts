'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { expensesApi, CreateExpenseRequest, UpdateExpenseRequest } from '../api/expensesApi';
import { toastApiError } from '@/lib/utils/apiError';
import type { ExpenseCategory } from '@/types';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...expenseKeys.lists(), params] as const,
};

export function useExpenses(params?: {
  page?: number;
  limit?: number;
  category?: ExpenseCategory;
  fromDate?: string;
  toDate?: string;
}) {
  return useQuery({
    queryKey: expenseKeys.list(params ?? {}),
    queryFn: () => expensesApi.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => expensesApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      toast.success('Gasto registrado exitosamente.');
    },
    onError: (error: unknown) => toastApiError(error, 'Error al registrar el gasto.'),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
      expensesApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      toast.success('Gasto actualizado.');
    },
    onError: (error: unknown) => toastApiError(error, 'Error al actualizar el gasto.'),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      toast.success('Gasto eliminado.');
    },
    onError: () => toast.error('Error al eliminar el gasto.'),
  });
}
