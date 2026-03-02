import apiClient from '@/lib/api/client';
import type { DashboardSummary, RevenueSummary, RepairStats, ExpenseSummary } from '@/types';

export const analyticsApi = {
  getSummary: () => apiClient.get<DashboardSummary>('/analytics/summary'),

  getRevenue: (params?: { year?: number; month?: number }) =>
    apiClient.get<RevenueSummary>('/analytics/revenue', { params }),

  getRepairStats: () => apiClient.get<RepairStats>('/analytics/repairs'),

  getExpenses: (params?: { year?: number; month?: number }) =>
    apiClient.get<ExpenseSummary>('/analytics/expenses', { params }),
};
