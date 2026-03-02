// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
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
  price: number;
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

// ─── Repair Management ────────────────────────────────────────────────────────

export type RepairStatus =
  | 'PENDING'
  | 'DIAGNOSED'
  | 'WAITING_APPROVAL'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'WAITING_PARTS'
  | 'COMPLETED'
  | 'DELIVERED'
  | 'CANCELLED';

export type UrgencyLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type ExpenseCategory =
  | 'PARTS'
  | 'TOOLS'
  | 'SHIPPING'
  | 'UTILITIES'
  | 'SALARIES'
  | 'RENT'
  | 'MARKETING'
  | 'OTHER';

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
}

export interface RepairOrderImage {
  id: string;
  fileKey: string;
}

export interface RepairOrderComment {
  id: string;
  message: string;
  internal: boolean;
  authorName: string | null;
  createdAt: string;
}

export interface RepairOrderStatusHistory {
  id: string;
  previousStatus: RepairStatus | null;
  newStatus: RepairStatus;
  timestamp: string;
}

export interface RepairOrderCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export interface RepairOrder {
  id: string;
  companyId: string;
  customerId: string;
  deviceModel: string;
  issueDescription: string;
  status: RepairStatus;
  urgencyLevel: UrgencyLevel;
  costEstimate: number | null;
  finalPrice: number | null;
  isApproved: boolean;
  publicTrackingToken: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  approvedAt: string | null;
  customer?: RepairOrderCustomer | null;
  images?: RepairOrderImage[];
  comments?: RepairOrderComment[];
  statusHistory?: RepairOrderStatusHistory[];
}

export interface Expense {
  id: string;
  companyId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  createdAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface RevenueSummary {
  totalRevenue: number;
  pendingRevenue: number;
  period: { year: number; month?: number };
}

export interface RepairStats {
  total: number;
  byStatus: Record<RepairStatus, number>;
  completed: number;
  avgRepairTimeHours: number | null;
}

export interface ExpenseSummary {
  totalExpenses: number;
  byCategory: Record<string, number>;
  period: { year: number; month?: number };
}

export interface DashboardSummary {
  revenue: RevenueSummary;
  repairs: RepairStats;
  expenses: ExpenseSummary;
  netProfit: number;
}

// ─── Public Tracking ──────────────────────────────────────────────────────────

export interface PublicStatusHistory {
  status: RepairStatus;
  statusLabel: string;
  timestamp: string;
}

export interface PublicTrackingData {
  deviceModel: string;
  issueDescription: string;
  status: RepairStatus;
  statusLabel: string;
  urgencyLevel: UrgencyLevel;
  urgencyLabel: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  costEstimate: number | null;
  finalPrice: number | null;
  customer: { name: string };
  statusHistory: PublicStatusHistory[];
  publicComments: { message: string; createdAt: string }[];
}
