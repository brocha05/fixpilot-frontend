'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Wrench,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';
import { useDashboardSummary } from '@/modules/analytics/hooks/useAnalytics';
import { useRepairOrders } from '@/modules/repairs/hooks/useRepairs';
import { REPAIR_STATUS_LABELS } from '@/modules/repairs/types/repairs.types';
import { getGreeting, formatMXN } from '@/lib/utils/formatters';
import type { RepairStatus } from '@/types';

const STATUS_ORDER: RepairStatus[] = [
  'PENDING',
  'DIAGNOSED',
  'WAITING_APPROVAL',
  'APPROVED',
  'IN_PROGRESS',
  'WAITING_PARTS',
  'COMPLETED',
  'DELIVERED',
  'CANCELLED',
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

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: recentOrders, isLoading: ordersLoading } = useRepairOrders({ limit: 6 });

  const activeCount = summary
    ? Object.entries(summary.repairs.byStatus)
        .filter(([s]) => !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(s))
        .reduce((a, [, v]) => a + v, 0)
    : 0;

  const totalForChart = summary?.repairs.total ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${getGreeting()}, ${user?.firstName ?? ''} 👋`}
        description="Resumen de tu taller de hoy."
      />

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ingresos del mes"
          value={summaryLoading ? '—' : formatMXN(summary?.revenue.totalRevenue ?? 0)}
          description="órdenes completadas"
          icon={DollarSign}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Ingreso pendiente"
          value={summaryLoading ? '—' : formatMXN(summary?.revenue.pendingRevenue ?? 0)}
          description="en órdenes activas"
          icon={Clock}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Utilidad neta"
          value={summaryLoading ? '—' : formatMXN(summary?.netProfit ?? 0)}
          description="ingresos − gastos"
          icon={TrendingUp}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Reparaciones activas"
          value={summaryLoading ? '—' : activeCount}
          description="en proceso ahora"
          icon={Wrench}
          isLoading={summaryLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Orders */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Órdenes recientes</CardTitle>
              <CardDescription>Últimas órdenes de reparación</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/orders" className="flex items-center gap-1 text-xs">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {ordersLoading ? (
              <div className="space-y-0 divide-y">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            ) : recentOrders?.data?.length ? (
              <div className="divide-y">
                {recentOrders.data.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{order.deviceModel}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {order.customer?.name ?? '—'}
                      </p>
                    </div>
                    <StatusBadge status={order.status} size="sm" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Wrench className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No hay órdenes aún.</p>
                <Button size="sm" asChild className="mt-1">
                  <Link href="/orders/new">Crear primera orden</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Por estado</CardTitle>
            <CardDescription>Distribución de todas las órdenes</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : totalForChart === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Sin datos todavía.</p>
            ) : (
              <div className="space-y-3">
                {STATUS_ORDER.filter((s) => (summary?.repairs.byStatus[s] ?? 0) > 0).map((s) => {
                  const count = summary?.repairs.byStatus[s] ?? 0;
                  const pct = totalForChart > 0 ? Math.round((count / totalForChart) * 100) : 0;
                  return (
                    <div key={s} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{REPAIR_STATUS_LABELS[s]}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${STATUS_BAR_COLORS[s]}`}
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

      {/* Quick metrics row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Completadas totales</p>
            <p className="text-2xl font-bold">
              {summaryLoading ? '—' : summary?.repairs.completed ?? 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
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
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gastos del mes</p>
            <MoneyDisplay
              amount={summary?.expenses.totalExpenses}
              size="lg"
              className="!text-2xl !font-bold text-foreground"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
