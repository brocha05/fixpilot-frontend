'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { billingApi } from '../api/billingApi';
import type { CheckoutSessionRequest } from '../types/billing.types';

export const billingKeys = {
  all: ['billing'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  subscription: () => [...billingKeys.all, 'subscription'] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const,
};

// ─── usePlans ─────────────────────────────────────────────────────────────────

export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: () => billingApi.getPlans().then((r) => r.data),
    staleTime: 1000 * 60 * 10, // 10 min
  });
}

// ─── useSubscription ─────────────────────────────────────────────────────────

export function useSubscription() {
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: () => billingApi.getSubscription().then((r) => r.data),
  });
}

// ─── useCheckout ──────────────────────────────────────────────────────────────

export function useCheckout() {
  return useMutation({
    mutationFn: (data: CheckoutSessionRequest) =>
      billingApi.createCheckoutSession(data).then((r) => r.data),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => toast.error('No se pudo iniciar el pago. Intenta de nuevo.'),
  });
}

// ─── useBillingPortal ─────────────────────────────────────────────────────────

export function useBillingPortal() {
  return useMutation({
    mutationFn: () => billingApi.createBillingPortalSession().then((r) => r.data),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => toast.error('No se pudo abrir el portal de facturación.'),
  });
}

// ─── useInvoices ──────────────────────────────────────────────────────────────

export function useInvoices() {
  return useQuery({
    queryKey: billingKeys.invoices(),
    queryFn: () => billingApi.getInvoices().then((r) => r.data),
  });
}

// ─── useCancelSubscription ────────────────────────────────────────────────────

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => billingApi.cancelSubscription().then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() });
      toast.success('La suscripción se cancelará al final del período de facturación.');
    },
    onError: () => toast.error('No se pudo cancelar la suscripción.'),
  });
}

// ─── useResumeSubscription ────────────────────────────────────────────────────

export function useResumeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => billingApi.resumeSubscription().then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() });
      toast.success('Suscripción reanudada.');
    },
    onError: () => toast.error('No se pudo reanudar la suscripción.'),
  });
}
