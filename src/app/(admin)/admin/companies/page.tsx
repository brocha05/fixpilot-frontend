'use client';

import { useState } from 'react';
import { MoreHorizontal, Power, PowerOff, ExternalLink } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  useAdminCompanies,
  useDeactivateCompany,
  useReactivateCompany,
} from '@/modules/admin/hooks/useAdmin';
import { usePagination } from '@/lib/hooks/usePagination';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { formatDate } from '@/lib/utils/formatters';
import Link from 'next/link';
import type { CompanyWithDetails } from '@/types';

export default function AdminCompaniesPage() {
  const [actionCompany, setActionCompany] = useState<{
    id: string;
    name: string;
    deleted: boolean;
  } | null>(null);
  const pagination = usePagination();
  const debouncedSearch = useDebounce(pagination.search, 350);

  const { data, isLoading } = useAdminCompanies({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch || undefined,
  });

  const { mutate: deactivate, isPending: deactivating } = useDeactivateCompany();
  const { mutate: reactivate, isPending: reactivating } = useReactivateCompany();

  const columns: ColumnDef<CompanyWithDetails>[] = [
    {
      id: 'company',
      header: 'Company',
      cell: ({ row }) => {
        const co = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
              {co.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <Link href={`/admin/companies/${co.id}`} className="font-medium hover:underline">
                {co.name}
              </Link>
              <p className="font-mono text-xs text-muted-foreground">{co.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const deleted = !!row.original.deletedAt;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${deleted ? 'bg-red-500' : 'bg-emerald-500'}`}
            />
            <span className="text-sm">{deleted ? 'Deactivated' : 'Active'}</span>
          </div>
        );
      },
    },
    {
      id: 'members',
      header: 'Members',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original._count?.users ?? row.original.users?.length ?? '—'}
        </span>
      ),
    },
    {
      id: 'subscription',
      header: 'Subscription',
      cell: ({ row }) => {
        const sub = row.original.subscription;
        if (!sub) return <span className="text-xs text-muted-foreground">None</span>;
        return (
          <Badge
            className={`text-xs ${
              sub.status === 'ACTIVE' || sub.status === 'TRIALING'
                ? 'bg-emerald-500/15 text-emerald-600'
                : 'bg-amber-500/15 text-amber-600'
            }`}
          >
            {sub.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{formatDate(getValue<string>())}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const co = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/companies/${co.id}`}>
                  <ExternalLink className="h-4 w-4" />
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {co.deletedAt ? (
                <DropdownMenuItem
                  onClick={() => setActionCompany({ id: co.id, name: co.name, deleted: true })}
                >
                  <Power className="h-4 w-4 text-emerald-500" />
                  Reactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setActionCompany({ id: co.id, name: co.name, deleted: false })}
                >
                  <PowerOff className="h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description={`${data?.total ?? 0} registered workspace${data?.total !== 1 ? 's' : ''}`}
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        totalPages={data?.totalPages}
        currentPage={pagination.page}
        onPageChange={pagination.setPage}
        searchValue={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder="Search by name or slug..."
      />

      <ConfirmDialog
        open={!!actionCompany}
        onOpenChange={(o) => !o && setActionCompany(null)}
        title={actionCompany?.deleted ? 'Reactivate company' : 'Deactivate company'}
        description={
          actionCompany?.deleted
            ? `Restore access for "${actionCompany?.name}"?`
            : `Deactivating "${actionCompany?.name}" will suspend all user access. You can reactivate it later.`
        }
        confirmLabel={actionCompany?.deleted ? 'Reactivate' : 'Deactivate'}
        variant={actionCompany?.deleted ? 'default' : 'destructive'}
        isLoading={deactivating || reactivating}
        onConfirm={() => {
          if (!actionCompany) return;
          const fn = actionCompany.deleted ? reactivate : deactivate;
          fn(actionCompany.id, { onSuccess: () => setActionCompany(null) });
        }}
      />
    </div>
  );
}
