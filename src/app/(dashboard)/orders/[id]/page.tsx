'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Wrench,
  Clock,
  MessageSquare,
  Edit2,
  Check,
  X,
  Plus,
  DollarSign,
  Bell,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge, UrgencyBadge } from '@/components/shared/StatusBadge';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Timeline } from '@/components/shared/Timeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useRepairOrder,
  useChangeStatus,
  useUpdateRepairOrder,
  useAddComment,
} from '@/modules/repairs/hooks/useRepairs';
import { ALLOWED_TRANSITIONS, REPAIR_STATUS_LABELS } from '@/modules/repairs/types/repairs.types';
import { formatDate, formatDateTime } from '@/lib/utils/formatters';
import type { RepairStatus } from '@/types';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useRepairOrder(id);
  const { mutate: changeStatus, isPending: changingStatus } = useChangeStatus();
  const { mutate: updateOrder, isPending: updating } = useUpdateRepairOrder();
  const { mutate: addComment, isPending: addingComment } = useAddComment();

  const [statusDialog, setStatusDialog] = useState<RepairStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [editingFinancials, setEditingFinancials] = useState(false);
  const [costEstimate, setCostEstimate] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [commentText, setCommentText] = useState('');
  const [internalComment, setInternalComment] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-7 w-52" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-60 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <Wrench className="h-10 w-10 text-muted-foreground/20" />
        <p className="text-sm font-medium text-muted-foreground">Orden no encontrada.</p>
        <Button variant="outline" asChild>
          <Link href="/orders">Volver a órdenes</Link>
        </Button>
      </div>
    );
  }

  const nextStatuses = ALLOWED_TRANSITIONS[order.status] ?? [];

  const handleChangeStatus = () => {
    if (!statusDialog) return;
    changeStatus(
      { id: order.id, data: { status: statusDialog, note: statusNote || undefined } },
      {
        onSuccess: () => {
          setStatusDialog(null);
          setStatusNote('');
        },
      }
    );
  };

  const handleSaveFinancials = () => {
    updateOrder(
      {
        id: order.id,
        data: {
          costEstimate: costEstimate ? Number(costEstimate) : undefined,
          finalPrice: finalPrice ? Number(finalPrice) : undefined,
        },
      },
      { onSuccess: () => setEditingFinancials(false) }
    );
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment(
      { id: order.id, data: { message: commentText, internal: internalComment } },
      {
        onSuccess: () => {
          setCommentText('');
          setInternalComment(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold truncate">{order.deviceModel}</h2>
            <StatusBadge status={order.status} size="lg" />
            <UrgencyBadge urgency={order.urgencyLevel} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Creada el {formatDate(order.createdAt, { dateStyle: 'long' })}
            {order.completedAt && (
              <> · Completada el {formatDate(order.completedAt, { dateStyle: 'long' })}</>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left column ────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Device Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                Dispositivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Modelo
                </p>
                <p className="mt-1 text-sm font-medium">{order.deviceModel}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Problema reportado
                </p>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                  {order.issueDescription}
                </p>
              </div>
              {order.publicTrackingToken && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Enlace de seguimiento
                  </p>
                  <p className="mt-1 break-all text-xs font-mono text-muted-foreground">
                    /track/{order.publicTrackingToken}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Comentarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.comments && order.comments.length > 0 ? (
                <div className="space-y-3">
                  {order.comments.map((c) => (
                    <div
                      key={c.id}
                      className={`rounded-lg border px-4 py-3 text-sm ${
                        c.internal
                          ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {c.authorName ?? 'Técnico'}
                          {c.internal && (
                            <span className="ml-2 rounded-full bg-amber-200 px-1.5 py-0.5 text-[10px] text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                              Interno
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDateTime(c.createdAt)}
                        </span>
                      </div>
                      <p className="leading-relaxed">{c.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin comentarios aún.</p>
              )}

              {/* Add comment form */}
              <div className="border-t pt-4 space-y-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={2}
                  placeholder="Escribe un comentario..."
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex items-center justify-between gap-2">
                  <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={internalComment}
                      onChange={(e) => setInternalComment(e.target.checked)}
                      className="rounded"
                    />
                    Solo visible para el equipo
                  </label>
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || addingComment}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right column ───────────────────────────── */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-muted-foreground" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.customer ? (
                <div className="space-y-1">
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                  {order.customer.email && (
                    <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>

          {/* Status & Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusBadge status={order.status} size="lg" />

              {/* "Request Approval" — primary CTA when in DIAGNOSED */}
              {order.status === 'DIAGNOSED' && nextStatuses.includes('WAITING_APPROVAL') && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                  <p className="mb-2 text-xs font-medium text-amber-800 dark:text-amber-300">
                    El equipo está diagnosticado. ¿Listo para pedir aprobación al cliente?
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => {
                      setStatusDialog('WAITING_APPROVAL');
                      setStatusNote('');
                    }}
                  >
                    <Bell className="mr-2 h-3.5 w-3.5" />
                    Solicitar aprobación
                  </Button>
                </div>
              )}

              {nextStatuses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Otras transiciones:</p>
                  <div className="flex flex-wrap gap-2">
                    {nextStatuses
                      .filter((s) => !(order.status === 'DIAGNOSED' && s === 'WAITING_APPROVAL'))
                      .map((s) => (
                        <Button
                          key={s}
                          variant={s === 'CANCELLED' ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setStatusDialog(s);
                            setStatusNote('');
                          }}
                        >
                          {REPAIR_STATUS_LABELS[s]}
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking link */}
          {order.publicTrackingToken && (
            <Card>
              <CardContent className="p-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Enlace de seguimiento del cliente
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-[11px]">
                    /track/{order.publicTrackingToken.slice(0, 16)}…
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 shrink-0 p-0"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/track/${order.publicTrackingToken}`
                      );
                      toast.success('Enlace copiado al portapapeles.');
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Costos
              </CardTitle>
              {!editingFinancials ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setCostEstimate(order.costEstimate != null ? String(order.costEstimate) : '');
                    setFinalPrice(order.finalPrice != null ? String(order.finalPrice) : '');
                    setEditingFinancials(true);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <div className="flex gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleSaveFinancials}
                    disabled={updating}
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setEditingFinancials(false)}
                  >
                    <X className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {editingFinancials ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Estimado (MXN)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={costEstimate}
                      onChange={(e) => setCostEstimate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Precio final (MXN)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={finalPrice}
                      onChange={(e) => setFinalPrice(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimado</span>
                    <MoneyDisplay amount={order.costEstimate} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Precio final</span>
                    <MoneyDisplay
                      amount={order.finalPrice}
                      size="sm"
                      positive={!!order.finalPrice}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Historial de estados</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline
                  items={order.statusHistory.map((h) => ({
                    status: h.newStatus,
                    timestamp: h.timestamp,
                  }))}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Change Status Dialog ──────────────────────── */}
      <Dialog open={!!statusDialog} onOpenChange={(open) => !open && setStatusDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cambio de estado</DialogTitle>
          </DialogHeader>
          {statusDialog && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                La orden pasará de{' '}
                <span className="font-medium text-foreground">
                  {REPAIR_STATUS_LABELS[order.status]}
                </span>{' '}
                a{' '}
                <span className="font-medium text-foreground">
                  {REPAIR_STATUS_LABELS[statusDialog]}
                </span>
                .
              </p>
              <div className="space-y-1.5">
                <Label>Nota interna (opcional)</Label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={2}
                  placeholder="Escribe una nota sobre este cambio..."
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeStatus} disabled={changingStatus}>
              {changingStatus ? 'Guardando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
