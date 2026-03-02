'use client';

import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { TrendingUp, Wrench, Clock, Receipt, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { RevenueCard } from '@/components/shared/RevenueCard';
import { BarChart } from '@/components/shared/BarChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDashboardSummary,
  useRepairStats,
  useExpenseStats,
} from '@/modules/analytics/hooks/useAnalytics';
import { analyticsApi } from '@/modules/analytics/api/analyticsApi';
import { analyticsKeys } from '@/modules/analytics/hooks/useAnalytics';
import { REPAIR_STATUS_LABELS } from '@/modules/repairs/types/repairs.types';
import { formatMXN } from '@/lib/utils/formatters';
import type { RepairStatus, ExpenseCategory } from '@/types';

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

const MONTHS_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

const MONTHS_FULL = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const STATUS_BAR_COLORS: Record<RepairStatus, string> = {
  PENDING: 'bg-slate-400',
  DIAGNOSED: 'bg-violet-500',
  WAITING_APPROVAL: 'bg-amber-500',
  APPROVED: 'bg-blue-500',
  IN_PROGRESS: 'bg-indigo-500',
  WAITING_PARTS: 'bg-orange-500',
  COMPLETED: 'bg-emerald-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-400',
};

const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  PARTS: 'Refacciones',
  TOOLS: 'Herramientas',
  SHIPPING: 'Envíos',
  UTILITIES: 'Servicios',
  SALARIES: 'Salarios',
  RENT: 'Renta',
  MARKETING: 'Marketing',
  OTHER: 'Otros',
};

const EXPENSE_COLORS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-emerald-500',
  'bg-slate-400',
];

export default function AnalyticsPage() {
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [month, setMonth] = useState(String(CURRENT_MONTH));

  const periodParams = { year: Number(year), month: Number(month) };

  // Overview (all-time)
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: repairStats, isLoading: repairStatsLoading } = useRepairStats();

  // Period-specific
  const { data: expenseStats, isLoading: expensesLoading } = useExpenseStats(periodParams);

  // Monthly revenue for chart (all 12 months of selected year, parallel)
  const monthlyQueries = useQueries({
    queries: MONTHS_SHORT.map((_, i) => ({
      queryKey: analyticsKeys.revenue({ year: Number(year), month: i + 1 }),
      queryFn: () =>
        analyticsApi.getRevenue({ year: Number(year), month: i + 1 }).then((r) => r.data),
      staleTime: 300_000,
    })),
  });

  const monthlyLoading = monthlyQueries.some((q) => q.isLoading);
  const revenueForPeriod = monthlyQueries[Number(month) - 1]?.data;
  const totalExpenses = expenseStats?.totalExpenses ?? 0;
  const netProfit = (revenueForPeriod?.totalRevenue ?? 0) - totalExpenses;

  const chartData = MONTHS_SHORT.map((label, i) => ({
    label,
    value: monthlyQueries[i]?.data?.totalRevenue ?? 0,
  }));

  const repairsByStatus = repairStats?.byStatus ?? {};
  const totalRepairs = repairStats?.total ?? 0;
  const expensesByCategory = expenseStats?.byCategory ?? {};

  return (
    <div className="space-y-8">
      {/* Header + period filter */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Estadísticas" description="Resumen financiero y operativo del taller." />
        <div className="flex items-center gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS_FULL.map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Revenue Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RevenueCard
          title="Ingresos del período"
          amount={revenueForPeriod?.totalRevenue}
          subtitle="órdenes completadas"
          variant="default"
          isLoading={monthlyLoading}
        />
        <RevenueCard
          title="Ingreso pendiente"
          amount={revenueForPeriod?.pendingRevenue}
          subtitle="en órdenes activas"
          variant="neutral"
          isLoading={monthlyLoading}
        />
        <RevenueCard
          title="Gastos del período"
          amount={totalExpenses}
          subtitle="gastos registrados"
          variant="loss"
          isLoading={expensesLoading}
        />
        <RevenueCard
          title="Utilidad neta"
          amount={netProfit}
          subtitle="ingresos − gastos"
          variant={netProfit >= 0 ? 'profit' : 'loss'}
          isLoading={monthlyLoading || expensesLoading}
        />
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Ingresos por mes — {year}</CardTitle>
          <CardDescription>
            Ingresos completados por mes. Pasa el cursor sobre cada barra para ver el valor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart
            data={chartData}
            formatValue={formatMXN}
            height={200}
            primaryLabel="Ingresos"
            loading={monthlyLoading}
          />
        </CardContent>
      </Card>

      {/* Status distribution + Expenses by category */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Repairs by Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              Reparaciones por estado
            </CardTitle>
            <CardDescription>
              {repairStatsLoading ? '—' : `${totalRepairs} órdenes en total (histórico)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {repairStatsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : totalRepairs === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Sin reparaciones aún.
              </p>
            ) : (
              <div className="space-y-4">
                {(Object.entries(repairsByStatus) as [RepairStatus, number][])
                  .filter(([, count]) => count > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => {
                    const pct = totalRepairs > 0 ? Math.round((count / totalRepairs) * 100) : 0;
                    return (
                      <div key={status} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {REPAIR_STATUS_LABELS[status] ?? status}
                          </span>
                          <span className="font-semibold">
                            {count}{' '}
                            <span className="font-normal text-muted-foreground">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ${STATUS_BAR_COLORS[status]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Gastos por categoría
            </CardTitle>
            <CardDescription>
              {expensesLoading ? '—' : `Total: ${formatMXN(totalExpenses)}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : totalExpenses === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Sin gastos en este período.
              </p>
            ) : (
              <div className="space-y-4">
                {(Object.entries(expensesByCategory) as [string, number][])
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amount], idx) => {
                    const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                    const label = EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] ?? cat;
                    const color = EXPENSE_COLORS[idx % EXPENSE_COLORS.length];
                    return (
                      <div key={cat} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold">
                            {formatMXN(amount)}{' '}
                            <span className="font-normal text-muted-foreground">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ${color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick summary row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completadas totales</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '—' : (summary?.repairs.completed ?? 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tiempo promedio</p>
              <p className="text-2xl font-bold">
                {summaryLoading
                  ? '—'
                  : summary?.repairs.avgRepairTimeHours != null
                    ? `${summary.repairs.avgRepairTimeHours}h`
                    : '—'}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
              <Receipt className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reparaciones activas</p>
              <p className="text-2xl font-bold">
                {repairStatsLoading
                  ? '—'
                  : Object.entries(repairStats?.byStatus ?? {})
                      .filter(([s]) => !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(s))
                      .reduce((a, [, v]) => a + v, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
