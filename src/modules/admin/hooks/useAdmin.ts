'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi, type CreatePlanRequest, type UpdatePlanRequest } from '../api/adminApi';

export const adminKeys = {
  all: ['admin'] as const,
  companies: (params?: object) => [...adminKeys.all, 'companies', params] as const,
  company: (id: string) => [...adminKeys.all, 'companies', id] as const,
  subscriptions: (params?: object) => [...adminKeys.all, 'subscriptions', params] as const,
  plans: () => [...adminKeys.all, 'plans'] as const,
};

export function useAdminCompanies(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: adminKeys.companies(params),
    queryFn: () => adminApi.getCompanies(params).then((r) => r.data),
  });
}

export function useAdminCompany(id: string) {
  return useQuery({
    queryKey: adminKeys.company(id),
    queryFn: () => adminApi.getCompany(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useDeactivateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deactivateCompany(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success('Company deactivated.');
    },
    onError: () => toast.error('Failed to deactivate company.'),
  });
}

export function useReactivateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.reactivateCompany(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success('Company reactivated.');
    },
    onError: () => toast.error('Failed to reactivate company.'),
  });
}

export function useAdminSubscriptions(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: adminKeys.subscriptions(params),
    queryFn: () => adminApi.getSubscriptions(params).then((r) => r.data),
  });
}

// ── Plan management hooks ──────────────────────────────────────────────────────

export function useAdminPlans() {
  return useQuery({
    queryKey: adminKeys.plans(),
    queryFn: () => adminApi.getAllPlans().then((r) => r.data),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanRequest) => adminApi.createPlan(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.plans() });
      toast.success('Plan creado exitosamente.');
    },
    onError: () => toast.error('Error al crear el plan.'),
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) =>
      adminApi.updatePlan(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.plans() });
      toast.success('Plan actualizado.');
    },
    onError: () => toast.error('Error al actualizar el plan.'),
  });
}

export function useTogglePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? adminApi.activatePlan(id) : adminApi.deactivatePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.plans() });
      toast.success('Plan actualizado.');
    },
    onError: () => toast.error('Error al actualizar el plan.'),
  });
}
