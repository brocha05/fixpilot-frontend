'use client';

import { Users, CreditCard, FolderOpen, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUsers } from '@/modules/users/hooks/useUsers';
import { useSubscription } from '@/modules/billing/hooks/useSubscription';
import { useFiles } from '@/modules/files/hooks/useFiles';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';

function getStatusColor(status: string) {
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

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 5 });
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: filesData, isLoading: filesLoading } = useFiles({ limit: 5 });

  const totalUsers = usersData?.total ?? 0;
  const totalFiles = filesData?.total ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good ${getGreeting()}, ${user?.firstName ?? 'there'} 👋`}
        description="Here's what's happening in your workspace today."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Team Members"
          value={usersLoading ? '—' : totalUsers}
          description="in your company"
          icon={Users}
          isLoading={usersLoading}
        />
        <StatCard
          title="Files Stored"
          value={filesLoading ? '—' : totalFiles}
          description="uploaded files"
          icon={FolderOpen}
          isLoading={filesLoading}
        />
        <StatCard
          title="Subscription"
          value={subLoading ? '—' : (subscription?.plan?.name ?? 'No plan')}
          description={
            subscription
              ? `Renews ${formatDate(subscription.currentPeriodEnd)}`
              : 'Subscribe to get started'
          }
          icon={CreditCard}
          isLoading={subLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Members</CardTitle>
              <CardDescription>Latest additions to your team</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/users" className="flex items-center gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : usersData?.data?.length ? (
              <div className="space-y-3">
                {usersData.data.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {u.firstName.charAt(0)}
                      {u.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs capitalize">
                      {u.role.toLowerCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No members yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription status */}
      {subscription && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b bg-muted/30 px-6 py-4">
            <div>
              <h3 className="font-semibold">{subscription.plan?.name ?? 'Current Plan'}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(subscription.plan?.price ?? 0)} /{' '}
                {subscription.plan?.interval?.toLowerCase() ?? 'month'}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(subscription.status)}`}
            >
              {subscription.status}
            </span>
          </div>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Current period: {formatDate(subscription.currentPeriodStart)} –{' '}
                {formatDate(subscription.currentPeriodEnd)}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/billing">Manage billing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
