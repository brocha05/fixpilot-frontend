'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, SlidersHorizontal, Wrench } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, UrgencyBadge } from '@/components/shared/StatusBadge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useRepairOrders } from '@/modules/repairs/hooks/useRepairs';
import { REPAIR_STATUS_LABELS, URGENCY_LABELS } from '@/modules/repairs/types/repairs.types';
import { formatDate } from '@/lib/utils/formatters';
import type { RepairStatus, UrgencyLevel } from '@/types';

const ALL_STATUSES: RepairStatus[] = [
  'PENDING', 'DIAGNOSED', 'WAITING_APPROVAL', 'APPROVED',
  'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED', 'CANCELLED',
];

const ALL_URGENCIES: UrgencyLevel[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'ALL'>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useRepairOrders({
    page,
    limit: 20,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    urgencyLevel: urgencyFilter !== 'ALL' ? urgencyFilter : undefined,
  });

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  // Client-side name/phone search (API doesn't support text search on orders)
  const filtered = search.trim()
    ? orders.filter(
        (o) =>
          o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
          o.customer?.phone?.includes(search) ||
          o.deviceModel.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Órdenes de Reparación"
        description={`${total} orden${total !== 1 ? 'es' : ''} en total`}
        action={
          <Button asChild>
            <Link href="/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva orden
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, teléfono o equipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as RepairStatus | 'ALL'); setPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{REPAIR_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={urgencyFilter} onValueChange={(v) => { setUrgencyFilter(v as UrgencyLevel | 'ALL'); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Urgencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toda urgencia</SelectItem>
            {ALL_URGENCIES.map((u) => (
              <SelectItem key={u} value={u}>{URGENCY_LABELS[u]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(statusFilter !== 'ALL' || urgencyFilter !== 'ALL' || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('ALL'); setUrgencyFilter('ALL'); setSearch(''); setPage(1); }}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="hidden border-b bg-muted/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[1fr_1fr_140px_100px_100px_80px]">
          <span>Equipo</span>
          <span>Cliente</span>
          <span>Estado</span>
          <span>Urgencia</span>
          <span>Precio</span>
          <span>Fecha</span>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32 ml-4" />
                  <Skeleton className="h-5 w-24 ml-auto" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Wrench className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">No se encontraron órdenes</p>
              <p className="text-xs text-muted-foreground">Intenta cambiar los filtros o crea una nueva orden.</p>
              <Button size="sm" asChild className="mt-2">
                <Link href="/orders/new">
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Nueva orden
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group flex flex-col gap-1 px-6 py-4 transition-colors hover:bg-muted/30 md:grid md:grid-cols-[1fr_1fr_140px_100px_100px_80px] md:items-center md:gap-4"
                >
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {order.deviceModel}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{order.issueDescription}</p>
                  </div>
                  <div>
                    <p className="text-sm">{order.customer?.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{order.customer?.phone ?? ''}</p>
                  </div>
                  <StatusBadge status={order.status} size="sm" />
                  <UrgencyBadge urgency={order.urgencyLevel} />
                  <MoneyDisplay amount={order.finalPrice ?? order.costEstimate} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt, { day: '2-digit', month: 'short' })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {page} de {pages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
