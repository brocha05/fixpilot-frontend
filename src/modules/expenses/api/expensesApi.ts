import apiClient from '@/lib/api/client';
import type { PaginatedResponse, Expense, ExpenseCategory } from '@/types';
import type { PaginationParams } from '@/types';

export interface CreateExpenseRequest {
  description: string;
  amount: number;
  category: ExpenseCategory;
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {}

export const expensesApi = {
  getAll: (params?: PaginationParams & { category?: ExpenseCategory; fromDate?: string; toDate?: string }) =>
    apiClient.get<PaginatedResponse<Expense>>('/expenses', { params }),

  getById: (id: string) => apiClient.get<Expense>(`/expenses/${id}`),

  create: (data: CreateExpenseRequest) => apiClient.post<Expense>('/expenses', data),

  update: (id: string, data: UpdateExpenseRequest) =>
    apiClient.patch<Expense>(`/expenses/${id}`, data),

  remove: (id: string) => apiClient.delete<void>(`/expenses/${id}`),
};
