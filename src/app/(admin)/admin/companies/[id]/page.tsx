'use client';

import { use } from 'react';
import { ArrowLeft, Building2, Users, CreditCard, Power, PowerOff, Clock } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  useAdminCompany,
  useDeactivateCompany,
  useReactivateCompany,
} from '@/modules/admin/hooks/useAdmin';
import { formatDate, formatCurrency, formatInitials } from '@/lib/utils/formatters';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

function subStatusColor(status: string) {
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

export default function AdminCompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [actionOpen, setActionOpen] = useState(false);
  const { data: company, isLoading } = useAdminCompany(id);
  const { mutate: deactivate, isPending: deactivating } = useDeactivateCompany();
  const { mutate: reactivate, isPending: reactivating } = useReactivateCompany();

  const isDeleted = !!company?.deletedAt;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLoading ? '…' : (company?.name ?? 'Company')}
        description={company?.slug ? `/${company.slug}` : ''}
      >
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/companies">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        {!isLoading && (
          <Button
            variant={isDeleted ? 'default' : 'destructive'}
            size="sm"
            onClick={() => setActionOpen(true)}
          >
            {isDeleted ? (
              <>
                <Power className="h-4 w-4" />
                Reactivate
              </>
            ) : (
              <>
                <PowerOff className="h-4 w-4" />
                Deactivate
              </>
            )}
          </Button>
        )}
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Company Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isDeleted ? 'bg-red-500' : 'bg-emerald-500'}`}
                  />
                  <span>{isDeleted ? 'Deactivated' : 'Active'}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="mt-0.5 font-mono text-xs">{company?.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Slug</p>
                <p className="mt-0.5 font-mono text-xs">{company?.slug}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stripe Customer</p>
                <p className="mt-0.5 font-mono text-xs">{company?.stripeCustomerId ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="mt-0.5">{formatDate(company!.createdAt)}</p>
              </div>
              {isDeleted && (
                <div>
                  <p className="text-xs text-muted-foreground">Deleted</p>
                  <p className="mt-0.5 text-destructive">{formatDate(company!.deletedAt!)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {company?.subscription ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {company.subscription.plan?.name ?? 'Unknown'}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        subStatusColor(company.subscription.status)
                      )}
                    >
                      {company.subscription.status}
                    </span>
                  </div>
                  {company.subscription.plan && (
                    <p className="text-muted-foreground">
                      {formatCurrency(company.subscription.plan.price)} /{' '}
                      {company.subscription.plan.interval.toLowerCase()}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Start</p>
                      <p className="text-xs font-medium">
                        {formatDate(company.subscription.currentPeriodStart)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">End</p>
                      <p className="text-xs font-medium">
                        {formatDate(company.subscription.currentPeriodEnd)}
                      </p>
                    </div>
                  </div>
                  {company.subscription.cancelAtPeriodEnd && (
                    <div className="flex items-center gap-1.5 rounded-md bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                      <Clock className="h-3.5 w-3.5" />
                      Cancels at period end
                    </div>
                  )}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">No subscription</p>
              )}
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Members
              </CardTitle>
              <CardDescription>
                {company?.users?.length ?? 0} user{company?.users?.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {company?.users?.length ? (
                company.users.slice(0, 8).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 border-b px-6 py-3 last:border-0"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                        {formatInitials(u.firstName, u.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge
                      variant={u.role === 'ADMIN' ? 'default' : 'secondary'}
                      className="shrink-0 text-[10px]"
                    >
                      {u.role.toLowerCase()}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">No members</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={actionOpen}
        onOpenChange={setActionOpen}
        title={isDeleted ? 'Reactivate company' : 'Deactivate company'}
        description={
          isDeleted
            ? `Restore access for "${company?.name}"? All users will be able to log in again.`
            : `Deactivate "${company?.name}"? All users will lose access immediately.`
        }
        confirmLabel={isDeleted ? 'Reactivate' : 'Deactivate'}
        variant={isDeleted ? 'default' : 'destructive'}
        isLoading={deactivating || reactivating}
        onConfirm={() => {
          const fn = isDeleted ? reactivate : deactivate;
          fn(id, { onSuccess: () => setActionOpen(false) });
        }}
      />
    </div>
  );
}
