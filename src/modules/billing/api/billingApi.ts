import apiClient from '@/lib/api/client';
import type { Plan, Subscription, Invoice } from '@/types';
import type {
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  BillingPortalResponse,
} from '../types/billing.types';

export const billingApi = {
  getPlans: () => apiClient.get<Plan[]>('/subscriptions/plans'),

  getSubscription: () => apiClient.get<Subscription>('/subscriptions'),

  getInvoices: () => apiClient.get<Invoice[]>('/subscriptions/invoices'),

  createCheckoutSession: (data: CheckoutSessionRequest) =>
    apiClient.post<CheckoutSessionResponse>('/subscriptions/checkout', data),

  createBillingPortalSession: () => apiClient.get<BillingPortalResponse>('/subscriptions/portal'),

  cancelSubscription: () => apiClient.delete<{ message: string }>('/subscriptions/cancel'),

  resumeSubscription: () => apiClient.post<{ message: string }>('/subscriptions/resume'),
};
