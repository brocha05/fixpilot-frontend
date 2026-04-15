'use client';

import { useState } from 'react';
import { ExternalLink, Download, CreditCard, CheckCircle2, RotateCcw, Zap } from 'lucide-react';
import {
  useSubscription,
  usePlans,
  useBillingPortal,
  useInvoices,
  useCancelSubscription,
  useResumeSubscription,
  useCheckout,
} from '@/modules/billing/hooks/useSubscription';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { Plan } from '@/types';

const subscriptionStatusLabel: Record<string, string> = {
  ACTIVE: 'Activo',
  TRIALING: 'En prueba',
  PAST_DUE: 'Vencida',
  CANCELED: 'Cancelado',
  INCOMPLETE: 'Incompleto',
  UNPAID: 'Sin pago',
};

const invoiceStatusLabel: Record<string, string> = {
  paid: 'Pagada',
  open: 'Pendiente',
  void: 'Anulada',
  uncollectible: 'Incobrable',
  draft: 'Borrador',
};

function statusVariant(status: string) {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
    case 'TRIALING':
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
    case 'PAST_DUE':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
    case 'CANCELED':
      return 'bg-red-500/15 text-red-600 dark:text-red-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function PlanCard({
  plan,
  isCurrent,
  onSelect,
  loading,
}: {
  plan: Plan;
  isCurrent: boolean;
  onSelect: (priceId: string) => void;
  loading: boolean;
}) {
  return (
    <div
      className={cn(
        'relative rounded-xl border p-5 transition-all',
        isCurrent ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/40'
      )}
    >
      {isCurrent && (
        <span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          Actual
        </span>
      )}
      <h3 className="font-semibold">{plan.name}</h3>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold">{formatCurrency(plan.price)}</span>
        <span className="text-sm text-muted-foreground">/{plan.interval.toLowerCase()}</span>
      </div>
      {Array.isArray(plan.features) && plan.features.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
      )}
      {!isCurrent && (
        <Button
          size="sm"
          className="mt-4 w-full"
          disabled={loading}
          onClick={() => onSelect(plan.stripePriceId)}
        >
          <Zap className="h-3.5 w-3.5" />
          {loading ? 'Redirigiendo...' : 'Suscribirse'}
        </Button>
      )}
    </div>
  );
}

export default function BillingPage() {
  const [cancelOpen, setCancelOpen] = useState(false);
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { mutate: openPortal, isPending: portalPending } = useBillingPortal();
  const { mutate: cancelSub, isPending: cancelPending } = useCancelSubscription();
  const { mutate: resumeSub, isPending: resumePending } = useResumeSubscription();
  const { mutate: checkout, isPending: checkoutPending } = useCheckout();

  const currentPlanId = subscription?.planId;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Facturación"
        description="Administra tu suscripción, método de pago y facturas."
      >
        <Button
          variant="outline"
          onClick={() => openPortal()}
          disabled={portalPending || !subscription}
        >
          <ExternalLink className="h-4 w-4" />
          {portalPending ? 'Abriendo...' : 'Portal de facturación'}
        </Button>
      </PageHeader>

      {/* Current subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Suscripción Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : subscription ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">
                      {subscription.plan?.name ?? 'Plan Activo'}
                    </p>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        statusVariant(subscription.status)
                      )}
                    >
                      {subscriptionStatusLabel[subscription.status?.toUpperCase()] ?? subscription.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatCurrency(subscription.plan?.price ?? 0)} /{' '}
                    {subscription.plan?.interval?.toLowerCase() ?? 'mes'}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 rounded-lg bg-muted/40 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Inicio del período</p>
                  <p className="font-medium">{formatDate(subscription.currentPeriodStart)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {subscription.cancelAtPeriodEnd ? 'Cancela el' : 'Renueva el'}
                  </p>
                  <p className="font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    La suscripción cancelará el {formatDate(subscription.currentPeriodEnd)}.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resumeSub()}
                    disabled={resumePending}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {resumePending ? 'Reanudando...' : 'Reanudar'}
                  </Button>
                </div>
              )}

              {!subscription.cancelAtPeriodEnd && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancelar suscripción
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">Sin suscripción activa.</p>
              <p className="text-xs text-muted-foreground">Elige un plan para comenzar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="mb-4 font-semibold">Planes Disponibles</h2>
        {plansLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : plans?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={plan.id === currentPlanId}
                onSelect={(priceId) => checkout({ priceId })}
                loading={checkoutPending}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay planes disponibles.</p>
        )}
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Facturas</CardTitle>
          <CardDescription>Descarga facturas anteriores para tus registros.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {invoicesLoading ? (
            <div className="space-y-0 px-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b py-4 last:border-0"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : !invoices?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sin facturas aún.</p>
          ) : (
            invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between border-b px-6 py-4 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    Factura #{invoice.number ?? invoice.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.created
                      ? formatDate(new Date(invoice.created * 1000).toISOString())
                      : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                      invoice.status === 'paid'
                        ? 'bg-emerald-500/15 text-emerald-600'
                        : 'bg-amber-500/15 text-amber-600'
                    )}
                  >
                    {invoiceStatusLabel[invoice.status] ?? invoice.status}
                  </span>
                  {(invoice.invoicePdf || invoice.hostedInvoiceUrl) && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a
                        href={invoice.invoicePdf ?? invoice.hostedInvoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Descargar</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancelar suscripción"
        description="Tu suscripción se cancelará al final del período de facturación. Tendrás acceso hasta entonces."
        confirmLabel="Cancelar suscripción"
        variant="destructive"
        isLoading={cancelPending}
        onConfirm={() => cancelSub(undefined, { onSuccess: () => setCancelOpen(false) })}
      />
    </div>
  );
}
