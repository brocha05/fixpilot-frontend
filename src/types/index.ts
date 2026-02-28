// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, string[]>;
}

export type PaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  companyId: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Company ──────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CompanyWithDetails extends Company {
  users?: User[];
  subscription?: Subscription;
  _count?: { users: number };
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

export type PlanInterval = 'MONTH' | 'YEAR';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  stripePriceId: string;
  stripeProductId: string;
  interval: PlanInterval;
  price: number; // in cents
  currency: string;
  isActive: boolean;
  features: string[];
  limits: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

// ─── Billing / Subscription ───────────────────────────────────────────────────

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'TRIALING'
  | 'INCOMPLETE'
  | 'UNPAID';

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  plan?: Plan;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: string;
  amount: number;
  currency: string;
  created: number;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  description?: string;
}

// ─── Files ────────────────────────────────────────────────────────────────────

export interface FileRecord {
  id: string;
  companyId: string;
  uploadedById: string;
  key: string;
  bucket: string;
  originalName: string;
  mimeType: string;
  size: number;
  resourceType?: string;
  resourceId?: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

// ─── Usage ────────────────────────────────────────────────────────────────────

export interface UsageStats {
  users: { used: number; limit: number };
  storage: { used: number; limit: number };
  apiCalls: { used: number; limit: number };
  period: { start: string; end: string };
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export interface OnboardingStep {
  step: string;
  completed: boolean;
  completedAt?: string;
}

export interface OnboardingStatus {
  completed: boolean;
  steps: OnboardingStep[];
}
