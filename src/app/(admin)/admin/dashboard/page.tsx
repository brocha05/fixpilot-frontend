'use client';

import { Building2, CreditCard, Users, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAdminCompanies, useAdminSubscriptions } from '@/modules/admin/hooks/useAdmin';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
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

export default function AdminDashboardPage() {
  const { data: companiesData, isLoading: compLoading } = useAdminCompanies({ limit: 5 });
  const { data: subsData, isLoading: subsLoading } = useAdminSubscriptions({ limit: 5 });

  const totalCompanies = companiesData?.total ?? 0;
  const totalSubs = subsData?.total ?? 0;

  const activeCount =
    subsData?.data?.filter((s) => s.status === 'ACTIVE' || s.status === 'TRIALING').length ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Overview" description="Platform-wide metrics and management.">
        <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Super Admin</span>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Companies"
          value={compLoading ? '—' : totalCompanies}
          icon={Building2}
          isLoading={compLoading}
        />
        <StatCard
          title="Subscriptions"
          value={subsLoading ? '—' : totalSubs}
          icon={CreditCard}
          isLoading={subsLoading}
        />
        <StatCard
          title="Active / Trialing"
          value={subsLoading ? '—' : activeCount}
          description="paying customers"
          icon={TrendingUp}
          isLoading={subsLoading}
        />
        <StatCard
          title="At Risk"
          value={
            subsLoading ? '—' : (subsData?.data?.filter((s) => s.status === 'PAST_DUE').length ?? 0)
          }
          description="past due"
          icon={Users}
          isLoading={subsLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent companies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Companies</CardTitle>
              <CardDescription>Latest registered workspaces</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/companies" className="flex items-center gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {compLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 border-b px-6 py-3.5 last:border-0">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : companiesData?.data?.length ? (
              companiesData.data.map((co) => (
                <Link
                  key={co.id}
                  href={`/admin/companies/${co.id}`}
                  className="flex items-center gap-3 border-b px-6 py-3.5 transition-colors last:border-0 hover:bg-muted/40"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {co.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{co.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{co.slug}</p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(co.createdAt)}
                  </p>
                  {co.deletedAt && (
                    <Badge variant="destructive" className="shrink-0 text-[10px]">
                      Deleted
                    </Badge>
                  )}
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No companies yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent subscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Subscriptions</CardTitle>
              <CardDescription>Latest subscription activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/subscriptions" className="flex items-center gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {subsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b px-6 py-3.5 last:border-0"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))
            ) : subsData?.data?.length ? (
              subsData.data.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between border-b px-6 py-3.5 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{sub.plan?.name ?? 'Unknown plan'}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.plan ? formatCurrency(sub.plan.price) : '—'} ·{' '}
                      {formatDate(sub.currentPeriodEnd)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      subStatusColor(sub.status)
                    )}
                  >
                    {sub.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No subscriptions.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
