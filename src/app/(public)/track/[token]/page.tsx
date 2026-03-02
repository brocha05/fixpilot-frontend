'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Package,
  AlertCircle,
  ThumbsUp,
  PartyPopper,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trackingApi } from '@/modules/tracking/api/trackingApi';
import { formatDateTime, formatMXN } from '@/lib/utils/formatters';
import type { RepairStatus } from '@/types';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_ICONS: Partial<Record<RepairStatus, React.ComponentType<{ className?: string }>>> = {
  PENDING: Clock,
  DIAGNOSED: Wrench,
  WAITING_APPROVAL: AlertCircle,
  APPROVED: CheckCircle2,
  IN_PROGRESS: Wrench,
  WAITING_PARTS: Package,
  COMPLETED: CheckCircle2,
  DELIVERED: ThumbsUp,
  CANCELLED: AlertCircle,
};

const STATUS_THEME: Record<
  RepairStatus,
  { card: string; icon: string; dot: string }
> = {
  PENDING:          { card: 'border-slate-200 bg-slate-50',    icon: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400' },
  DIAGNOSED:        { card: 'border-violet-200 bg-violet-50',  icon: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500' },
  WAITING_APPROVAL: { card: 'border-amber-300 bg-amber-50',    icon: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  APPROVED:         { card: 'border-blue-200 bg-blue-50',      icon: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  IN_PROGRESS:      { card: 'border-indigo-200 bg-indigo-50',  icon: 'bg-indigo-100 text-indigo-700',  dot: 'bg-indigo-500' },
  WAITING_PARTS:    { card: 'border-orange-200 bg-orange-50',  icon: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-500' },
  COMPLETED:        { card: 'border-emerald-300 bg-emerald-50',icon: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
  DELIVERED:        { card: 'border-green-300 bg-green-50',    icon: 'bg-green-100 text-green-700',    dot: 'bg-green-500' },
  CANCELLED:        { card: 'border-red-200 bg-red-50',        icon: 'bg-red-100 text-red-600',        dot: 'bg-red-500' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrackOrderPage() {
  const { token } = useParams<{ token: string }>();
  const [approved, setApproved] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['tracking', token],
    queryFn: () => trackingApi.getByToken(token).then((r) => r.data),
    enabled: !!token && /^[a-f0-9]{64}$/.test(token),
    retry: false,
  });

  const { mutate: approveRepair, isPending: approving } = useMutation({
    mutationFn: () => trackingApi.approve(token),
    onSuccess: () => setApproved(true),
  });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 space-y-5">
        <div className="flex justify-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <Skeleton className="mx-auto h-6 w-40" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !order) {
    const msg =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'No encontramos ninguna orden con ese código de seguimiento.';
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <h1 className="text-xl font-bold">Orden no encontrada</h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">{msg}</p>
      </div>
    );
  }

  const theme = STATUS_THEME[order.status];
  const StatusIcon = STATUS_ICONS[order.status] ?? Clock;
  const isDelivered = order.status === 'DELIVERED';
  const isCompleted = order.status === 'COMPLETED';
  const isCancelled = order.status === 'CANCELLED';
  const isWaitingApproval = order.status === 'WAITING_APPROVAL';

  return (
    <div className="mx-auto max-w-md px-4 py-10 space-y-5 pb-16">

      {/* ── Branding ────────────────────────────────────────────────────────── */}
      <div className="text-center space-y-1.5">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-md">
            <Wrench className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <p className="text-lg font-bold tracking-tight">
          {process.env.NEXT_PUBLIC_APP_NAME ?? 'FixPilot'}
        </p>
        <p className="text-sm text-muted-foreground">
          Hola, <span className="font-medium text-foreground">{order.customer.name}</span> 👋
        </p>
      </div>

      {/* ── Completed / Delivered celebration ───────────────────────────────── */}
      {(isDelivered || isCompleted) && (
        <Card className="border-2 border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20">
          <CardContent className="p-5 text-center space-y-2">
            <div className="flex justify-center">
              <PartyPopper className="h-10 w-10 text-emerald-600" />
            </div>
            <p className="font-bold text-emerald-800 dark:text-emerald-300 text-lg">
              {isDelivered ? '¡Tu equipo está listo para recoger!' : '¡Reparación completada!'}
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              {isDelivered
                ? 'Tu dispositivo ha sido reparado y entregado. ¡Gracias por tu confianza!'
                : 'Tu dispositivo ha sido reparado exitosamente. Pasa a recogerlo.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Cancelled notice ────────────────────────────────────────────────── */}
      {isCancelled && (
        <Card className="border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">Orden cancelada</p>
              <p className="mt-0.5 text-sm text-red-700 dark:text-red-400">
                Esta orden fue cancelada. Contacta al taller si tienes alguna pregunta.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Current status card ──────────────────────────────────────────────── */}
      <Card className={`border-2 ${theme.card} dark:bg-transparent`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${theme.icon}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest opacity-60">
                Estado actual
              </p>
              <p className="text-xl font-bold">{order.statusLabel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Device + pricing info ───────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Equipo
            </p>
            <p className="mt-1 font-semibold">{order.deviceModel}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Problema reportado
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {order.issueDescription}
            </p>
          </div>

          {/* Pricing */}
          {(order.costEstimate != null || order.finalPrice != null) && (
            <div className="border-t pt-4">
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                Costos
              </p>
              <div className="grid grid-cols-2 gap-3">
                {order.costEstimate != null && (
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Estimado</p>
                    <p className="mt-0.5 text-lg font-bold">{formatMXN(order.costEstimate)}</p>
                  </div>
                )}
                {order.finalPrice != null && (
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center border border-emerald-200 dark:border-emerald-800">
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Precio final</p>
                    <p className="mt-0.5 text-lg font-bold text-emerald-700 dark:text-emerald-400">
                      {formatMXN(order.finalPrice)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Approval card ───────────────────────────────────────────────────── */}
      {isWaitingApproval && !approved && (
        <Card className="border-2 border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  Se requiere tu aprobación
                </p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  El técnico diagnosticó tu equipo y necesita tu autorización para comenzar la
                  reparación.
                  {order.costEstimate != null && (
                    <> El costo estimado es de{' '}
                      <span className="font-semibold">{formatMXN(order.costEstimate)}</span>.
                    </>
                  )}
                </p>
              </div>
            </div>
            <Button
              className="w-full bg-amber-500 text-white hover:bg-amber-600"
              onClick={() => approveRepair()}
              disabled={approving}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              {approving ? 'Aprobando...' : 'Aprobar reparación'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Approved confirmation ────────────────────────────────────────────── */}
      {approved && (
        <Card className="border-2 border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              ¡Reparación aprobada! El técnico comenzará pronto.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Tech notes (public comments) ───────────────────────────────────── */}
      {order.publicComments && order.publicComments.length > 0 && (
        <div className="space-y-3">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Notas del técnico
          </p>
          {order.publicComments.map((c, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-1">
                <p className="text-sm leading-relaxed">{c.message}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Status History timeline ─────────────────────────────────────────── */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="space-y-3">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Historial
          </p>
          <Card>
            <CardContent className="p-5">
              <ol className="space-y-0">
                {order.statusHistory.map((h, index) => {
                  const isLast = index === order.statusHistory.length - 1;
                  const dot = STATUS_THEME[h.status]?.dot ?? 'bg-slate-400';
                  return (
                    <li key={index} className="relative flex gap-4 pb-5 last:pb-0">
                      {!isLast && (
                        <div className="absolute left-[9px] top-5 bottom-0 w-px bg-border" />
                      )}
                      <span className={`relative z-10 mt-1 h-[18px] w-[18px] shrink-0 rounded-full ${dot}`} />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="text-sm font-semibold">{h.statusLabel}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDateTime(h.timestamp)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <p className="text-center text-xs text-muted-foreground">
        {process.env.NEXT_PUBLIC_APP_NAME ?? 'FixPilot'} · Servicio técnico profesional
      </p>
    </div>
  );
}
