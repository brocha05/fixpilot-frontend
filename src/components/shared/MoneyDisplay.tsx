import { cn } from '@/lib/utils/cn';
import { formatMXN } from '@/lib/utils/formatters';

interface MoneyDisplayProps {
  amount: number | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showEmpty?: boolean;
  positive?: boolean;
  negative?: boolean;
}

export function MoneyDisplay({
  amount,
  size = 'md',
  className,
  showEmpty = true,
  positive,
  negative,
}: MoneyDisplayProps) {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl font-semibold',
    xl: 'text-2xl font-bold',
  }[size];

  if (amount == null) {
    return showEmpty ? (
      <span className={cn('text-muted-foreground', sizeClass, className)}>—</span>
    ) : null;
  }

  return (
    <span
      className={cn(
        sizeClass,
        positive && 'text-emerald-600 dark:text-emerald-400',
        negative && 'text-red-600 dark:text-red-400',
        className
      )}
    >
      {formatMXN(amount)}
    </span>
  );
}
