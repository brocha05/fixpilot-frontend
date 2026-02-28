'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { useAdminSubscriptions } from '@/modules/admin/hooks/useAdmin';
import { usePagination } from '@/lib/hooks/usePagination';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { Subscription } from '@/types';

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
    case 'UNPAID':
      return 'bg-orange-500/15 text-orange-600 dark:text-orange-400';
    case 'INCOMPLETE':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

const columns: ColumnDef<Subscription>[] = [
  {
    id: 'plan',
    header: 'Plan',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.plan?.name ?? 'Unknown'}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.plan ? formatCurrency(row.original.plan.price) : '—'} /{' '}
          {row.original.plan?.interval?.toLowerCase() ?? '—'}
        </p>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span
        className={cn(
          'rounded-full px-2.5 py-0.5 text-xs font-semibold',
          subStatusColor(row.original.status)
        )}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    id: 'period',
    header: 'Current Period',
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {formatDate(row.original.currentPeriodStart)} – {formatDate(row.original.currentPeriodEnd)}
      </div>
    ),
  },
  {
    accessorKey: 'cancelAtPeriodEnd',
    header: 'Canceling',
    cell: ({ getValue }) => (
      <span
        className={
          getValue<boolean>()
            ? 'text-amber-600 text-xs font-medium'
            : 'text-muted-foreground text-xs'
        }
      >
        {getValue<boolean>() ? 'Yes' : 'No'}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{formatDate(getValue<string>())}</span>
    ),
  },
];

export default function AdminSubscriptionsPage() {
  const pagination = usePagination();
  const { data, isLoading } = useAdminSubscriptions({
    page: pagination.page,
    limit: pagination.limit,
  });

  const active =
    data?.data?.filter((s) => s.status === 'ACTIVE' || s.status === 'TRIALING').length ?? 0;
  const pastDue = data?.data?.filter((s) => s.status === 'PAST_DUE').length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description={`${data?.total ?? 0} total · ${active} active · ${pastDue} past due`}
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        totalPages={data?.totalPages}
        currentPage={pagination.page}
        onPageChange={pagination.setPage}
      />
    </div>
  );
}
