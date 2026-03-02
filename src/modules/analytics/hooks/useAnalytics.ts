'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: () => [...analyticsKeys.all, 'summary'] as const,
  revenue: (params: Record<string, unknown>) => [...analyticsKeys.all, 'revenue', params] as const,
  repairs: () => [...analyticsKeys.all, 'repairs'] as const,
  expenses: (params: Record<string, unknown>) => [...analyticsKeys.all, 'expenses', params] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: () => analyticsApi.getSummary().then((r) => r.data),
    staleTime: 60_000, // 1 min — analytics can be slightly stale
  });
}

export function useRevenue(params?: { year?: number; month?: number }) {
  return useQuery({
    queryKey: analyticsKeys.revenue(params ?? {}),
    queryFn: () => analyticsApi.getRevenue(params).then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useRepairStats() {
  return useQuery({
    queryKey: analyticsKeys.repairs(),
    queryFn: () => analyticsApi.getRepairStats().then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useExpenseStats(params?: { year?: number; month?: number }) {
  return useQuery({
    queryKey: analyticsKeys.expenses(params ?? {}),
    queryFn: () => analyticsApi.getExpenses(params).then((r) => r.data),
    staleTime: 60_000,
  });
}
