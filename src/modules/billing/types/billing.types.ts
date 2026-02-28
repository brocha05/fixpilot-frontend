import type { Subscription, PlanType, PlanFeatures, Plan, Invoice } from '@/types';

export type { Subscription, PlanType, PlanFeatures, Plan, Invoice };

export interface CheckoutSessionRequest {
  priceId: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface BillingPortalResponse {
  url: string;
}
