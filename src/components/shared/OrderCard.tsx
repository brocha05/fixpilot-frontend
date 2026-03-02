import Link from 'next/link';
import { Wrench, User, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, UrgencyBadge } from './StatusBadge';
import { MoneyDisplay } from './MoneyDisplay';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatters';
import type { RepairOrder } from '@/types';

interface OrderCardProps {
  order: RepairOrder;
  className?: string;
  compact?: boolean;
}

export function OrderCard({ order, className, compact = false }: OrderCardProps) {
  return (
    <Link href={`/orders/${order.id}`}>
      <Card
        className={cn(
          'group cursor-pointer transition-all hover:shadow-md hover:-translate-y-px',
          className
        )}
      >
        <CardContent className={cn('p-4', compact && 'p-3')}>
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Wrench className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                  {order.deviceModel}
                </p>
                {!compact && (
                  <p className="truncate text-xs text-muted-foreground">{order.issueDescription}</p>
                )}
              </div>
            </div>
            <StatusBadge status={order.status} size="sm" />
          </div>

          {/* Info row */}
          {!compact && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {order.customer && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {order.customer.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(order.createdAt, { day: '2-digit', month: 'short' })}
              </span>
              <UrgencyBadge urgency={order.urgencyLevel} />
            </div>
          )}

          {/* Footer row */}
          <div className="mt-3 flex items-center justify-between">
            {compact ? (
              order.customer && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {order.customer.name}
                </span>
              )
            ) : (
              <div />
            )}
            <div className="text-right">
              {order.finalPrice != null ? (
                <MoneyDisplay amount={order.finalPrice} size="sm" positive />
              ) : order.costEstimate != null ? (
                <MoneyDisplay amount={order.costEstimate} size="sm" />
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
