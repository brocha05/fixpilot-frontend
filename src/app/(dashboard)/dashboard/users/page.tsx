'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, MoreHorizontal, Mail, ShieldCheck, UserX } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  useUsers,
  useDeleteUser,
  useResendInvite,
  useUpdateUser,
} from '@/modules/users/hooks/useUsers';
import { useInviteUser } from '@/modules/company/hooks/useCompany';
import { usePagination } from '@/lib/hooks/usePagination';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { DataTable } from '@/components/shared/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { Modal } from '@/components/shared/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types';
import { formatDate, formatInitials } from '@/lib/utils/formatters';
import { useAuthStore } from '@/store/authStore';

const inviteSchema = z.object({
  email: z.string().email('Valid email required'),
  role: z.enum(['ADMIN', 'MEMBER']),
});
type InviteForm = z.infer<typeof inviteSchema>;

function RoleBadge({ role }: { role: string }) {
  const variants: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    ADMIN: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    MEMBER: 'bg-muted text-muted-foreground',
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[role] ?? variants.MEMBER}`}
    >
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}

export default function UsersPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { user: me } = useAuthStore();

  const pagination = usePagination();
  const debouncedSearch = useDebounce(pagination.search, 350);

  const { data, isLoading } = useUsers({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch || undefined,
  });

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: inviteUser, isPending: isInviting } = useInviteUser();
  const { mutate: resendInvite } = useResendInvite();
  const { mutate: updateUser } = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    setValue,
    formState: { errors },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'MEMBER' },
  });

  function onInvite(data: InviteForm) {
    inviteUser(data, {
      onSuccess: () => {
        setInviteOpen(false);
        resetForm();
      },
    });
  }

  const isAdmin = me?.role === 'ADMIN' || me?.role === 'SUPER_ADMIN';

  const columns: ColumnDef<User>[] = [
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {formatInitials(u.firstName, u.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {u.firstName} {u.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => <RoleBadge role={getValue<string>()} />,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${getValue<boolean>() ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}
          />
          <span className="text-sm text-muted-foreground">
            {getValue<boolean>() ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'emailVerified',
      header: 'Verified',
      cell: ({ getValue }) => (
        <Badge variant={getValue<boolean>() ? 'default' : 'secondary'} className="text-xs">
          {getValue<boolean>() ? 'Verified' : 'Pending'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{formatDate(getValue<string>())}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const u = row.original;
        if (!isAdmin || u.id === me?.id) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!u.emailVerified && (
                <DropdownMenuItem onClick={() => resendInvite(u.id)}>
                  <Mail className="h-4 w-4" />
                  Resend invite
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() =>
                  updateUser({ id: u.id, data: { role: u.role === 'ADMIN' ? 'MEMBER' : 'ADMIN' } })
                }
              >
                <ShieldCheck className="h-4 w-4" />
                Make {u.role === 'ADMIN' ? 'member' : 'admin'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteId(u.id)}
              >
                <UserX className="h-4 w-4" />
                Remove user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage your team members and their permissions.">
        {isAdmin && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invite user
          </Button>
        )}
      </PageHeader>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        totalPages={data?.totalPages}
        currentPage={pagination.page}
        onPageChange={pagination.setPage}
        searchValue={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder="Search by name or email..."
        toolbar={
          <span className="text-sm text-muted-foreground">
            {data?.total ?? 0} member{data?.total !== 1 ? 's' : ''}
          </span>
        }
      />

      {/* Invite modal */}
      <Modal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title="Invite team member"
        description="They'll receive an email to join your workspace."
      >
        <form onSubmit={handleSubmit(onInvite)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="inv-email">Email address</Label>
            <Input
              id="inv-email"
              type="email"
              {...register('email')}
              placeholder="jane@company.com"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-role">Role</Label>
            <Select
              defaultValue="MEMBER"
              onValueChange={(v) => setValue('role', v as 'ADMIN' | 'MEMBER')}
            >
              <SelectTrigger id="inv-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member — can view and use the workspace</SelectItem>
                <SelectItem value="ADMIN">Admin — full management access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isInviting}>
              {isInviting ? 'Sending...' : 'Send invitation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Remove user"
        description="This user will lose access immediately. This action cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() => {
          if (deleteId) deleteUser(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
      />
    </div>
  );
}
