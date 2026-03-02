import { cn } from '@/lib/utils/cn';
import { formatDateTime } from '@/lib/utils/formatters';
import type { RepairStatus } from '@/types';
import { REPAIR_STATUS_LABELS } from '@/modules/repairs/types/repairs.types';

interface TimelineItem {
  status: RepairStatus;
  statusLabel?: string;
  timestamp: string;
  isLast?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const STATUS_ICON_BG: Record<RepairStatus, string> = {
  PENDING: 'bg-slate-200 border-slate-300',
  DIAGNOSED: 'bg-violet-100 border-violet-300',
  WAITING_APPROVAL: 'bg-amber-100 border-amber-300',
  APPROVED: 'bg-blue-100 border-blue-300',
  IN_PROGRESS: 'bg-indigo-100 border-indigo-300',
  WAITING_PARTS: 'bg-orange-100 border-orange-300',
  COMPLETED: 'bg-emerald-100 border-emerald-300',
  DELIVERED: 'bg-green-100 border-green-300',
  CANCELLED: 'bg-red-100 border-red-300',
};

const STATUS_DOT_COLOR: Record<RepairStatus, string> = {
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

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn('space-y-0', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const label = item.statusLabel ?? REPAIR_STATUS_LABELS[item.status] ?? item.status;

        return (
          <li key={index} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
            )}

            {/* Dot */}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                STATUS_ICON_BG[item.status]
              )}
            >
              <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT_COLOR[item.status])} />
            </div>

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col pt-1">
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateTime(item.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
