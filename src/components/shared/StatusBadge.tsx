import { cn } from '@/lib/utils/cn';
import type { RepairStatus, UrgencyLevel } from '@/types';
import { REPAIR_STATUS_LABELS, URGENCY_LABELS } from '@/modules/repairs/types/repairs.types';

// ─── Repair Status ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<RepairStatus, string> = {
  PENDING: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  DIAGNOSED: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  WAITING_APPROVAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  APPROVED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  WAITING_PARTS: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const STATUS_DOT: Record<RepairStatus, string> = {
  PENDING: 'bg-slate-400',
  DIAGNOSED: 'bg-violet-500',
  WAITING_APPROVAL: 'bg-amber-500',
  APPROVED: 'bg-blue-500',
  IN_PROGRESS: 'bg-indigo-500',
  WAITING_PARTS: 'bg-orange-500',
  COMPLETED: 'bg-emerald-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
};

interface StatusBadgeProps {
  status: RepairStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, size = 'md', showDot = true, className }: StatusBadgeProps) {
  const label = REPAIR_STATUS_LABELS[status] ?? status;
  const sizeClass = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        STATUS_STYLES[status],
        sizeClass,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full shrink-0',
            STATUS_DOT[status],
            size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5'
          )}
        />
      )}
      {label}
    </span>
  );
}

// ─── Urgency Badge ────────────────────────────────────────────────────────────

const URGENCY_STYLES: Record<UrgencyLevel, string> = {
  LOW: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  NORMAL: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  HIGH: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        URGENCY_STYLES[urgency],
        className
      )}
    >
      {URGENCY_LABELS[urgency]}
    </span>
  );
}
