import { cn } from '@/lib/utils/cn';

export interface BarChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number; // for grouped bars (e.g. expenses)
  color?: string;
  secondaryColor?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  formatValue?: (v: number) => string;
  height?: number;
  showSecondary?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  className?: string;
  loading?: boolean;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function BarChart({
  data,
  formatValue = (v) => String(v),
  height = 180,
  showSecondary = false,
  primaryLabel,
  secondaryLabel,
  className,
  loading = false,
}: BarChartProps) {
  const allValues = data.flatMap((d) =>
    showSecondary && d.secondaryValue != null ? [d.value, d.secondaryValue] : [d.value]
  );
  const max = Math.max(...allValues, 1);

  if (loading) {
    return (
      <div className={cn('w-full', className)} style={{ height }}>
        <div className="flex h-full items-end gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-muted animate-pulse"
              style={{ height: `${20 + ((i * 17) % 60)}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Legend */}
      {(primaryLabel || secondaryLabel) && (
        <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
          {primaryLabel && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              {primaryLabel}
            </span>
          )}
          {showSecondary && secondaryLabel && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
              {secondaryLabel}
            </span>
          )}
        </div>
      )}

      {/* Bars */}
      <div className="relative flex items-end gap-1" style={{ height }}>
        {/* Y-axis grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <div
            key={pct}
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border/50"
            style={{ bottom: `${pct}%` }}
          />
        ))}

        {data.map((d, i) => {
          const primaryPct = clamp((d.value / max) * 100, 0, 100);
          const secondaryPct =
            showSecondary && d.secondaryValue != null
              ? clamp((d.secondaryValue / max) * 100, 0, 100)
              : 0;

          return (
            <div
              key={i}
              className="group relative flex flex-1 flex-col items-center justify-end gap-0.5"
              style={{ height: '100%' }}
            >
              {/* Grouped bars */}
              <div className="relative flex w-full items-end justify-center gap-0.5">
                {/* Primary bar */}
                <div
                  className={cn(
                    'relative w-full max-w-[28px] cursor-default rounded-t-sm transition-all duration-500',
                    d.color ?? 'bg-blue-500'
                  )}
                  style={{ height: `${primaryPct * (height / 100)}px`, minHeight: primaryPct > 0 ? 2 : 0 }}
                >
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {formatValue(d.value)}
                  </div>
                </div>

                {/* Secondary bar */}
                {showSecondary && secondaryPct > 0 && (
                  <div
                    className={cn(
                      'relative w-full max-w-[28px] rounded-t-sm transition-all duration-500',
                      d.secondaryColor ?? 'bg-red-400'
                    )}
                    style={{ height: `${secondaryPct * (height / 100)}px`, minHeight: 2 }}
                  />
                )}
              </div>

              {/* X-axis label */}
              <span className="mt-1.5 truncate text-[10px] text-muted-foreground">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
