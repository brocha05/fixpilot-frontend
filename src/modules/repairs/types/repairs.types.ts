import type { RepairStatus, UrgencyLevel, PaginationParams } from '@/types';

export interface CreateRepairOrderRequest {
  customerId: string;
  deviceModel: string;
  issueDescription: string;
  urgencyLevel?: UrgencyLevel;
  costEstimate?: number;
}

export interface UpdateRepairOrderRequest {
  deviceModel?: string;
  issueDescription?: string;
  urgencyLevel?: UrgencyLevel;
  costEstimate?: number;
  finalPrice?: number;
  isApproved?: boolean;
}

export interface ChangeStatusRequest {
  status: RepairStatus;
  note?: string;
}

export interface AddCommentRequest {
  message: string;
  internal?: boolean;
}

export interface RepairOrdersQueryParams extends PaginationParams {
  status?: RepairStatus;
  urgencyLevel?: UrgencyLevel;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
}

// Allowed transitions per status (mirrors backend FSM — frontend enforces same rules for UX)
export const ALLOWED_TRANSITIONS: Record<RepairStatus, RepairStatus[]> = {
  PENDING: ['DIAGNOSED', 'CANCELLED'],
  DIAGNOSED: ['WAITING_APPROVAL', 'APPROVED', 'CANCELLED'],
  WAITING_APPROVAL: ['APPROVED', 'CANCELLED'],
  APPROVED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_PARTS', 'COMPLETED', 'CANCELLED'],
  WAITING_PARTS: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  PENDING: 'Pendiente',
  DIAGNOSED: 'Diagnosticado',
  WAITING_APPROVAL: 'En espera de aprobación',
  APPROVED: 'Aprobado',
  IN_PROGRESS: 'En reparación',
  WAITING_PARTS: 'Esperando refacciones',
  COMPLETED: 'Completado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  LOW: 'Baja',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};
