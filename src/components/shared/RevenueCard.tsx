import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { formatMXN } from '@/lib/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';

interface RevenueCardProps {
  title: string;
  amount: number | null | undefined;
  subtitle?: string;
  trend?: number; // % change vs prior period
  variant?: 'default' | 'profit' | 'loss' | 'neutral';
  isLoading?: boolean;
  className?: string;
}

export function RevenueCard({
  title,
  amount,
  subtitle,
  trend,
  variant = 'default',
  isLoading,
  className,
}: RevenueCardProps) {
  const variantStyles = {
    default: 'border-l-4 border-l-blue-500',
    profit: 'border-l-4 border-l-emerald-500',
    loss: 'border-l-4 border-l-red-500',
    neutral: 'border-l-4 border-l-slate-300',
  };

  const amountStyles = {
    default: 'text-foreground',
    profit: 'text-emerald-600 dark:text-emerald-400',
    loss: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  };

  const TrendIcon =
    trend == null ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {title}
            </p>
            <p className={cn('mt-1.5 text-3xl font-bold', amountStyles[variant])}>
              {amount == null ? '—' : formatMXN(amount)}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              {TrendIcon && trend != null && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    trend > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : trend < 0
                        ? 'text-red-500'
                        : 'text-muted-foreground'
                  )}
                >
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(trend)}%
                </span>
              )}
              {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
