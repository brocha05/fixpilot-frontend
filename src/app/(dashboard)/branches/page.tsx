'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, MapPin, Star } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/modules/branches/hooks/useBranches';
import { usePagination } from '@/lib/hooks/usePagination';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { DataTable } from '@/components/shared/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { Modal } from '@/components/shared/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/cn';
import type { Branch, BranchStatus } from '@/types';

// ─── Form schema ──────────────────────────────────────────────────────────────

const branchSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  address: z.string().min(5, 'La dirección es obligatoria').max(300),
  city: z.string().min(2, 'La ciudad es obligatoria').max(100),
  state: z.string().min(2, 'El estado es obligatorio').max(100),
  zipCode: z.string().max(10).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  isMain: z.boolean().default(false),
  notes: z.string().max(500).optional().or(z.literal('')),
});

type BranchForm = z.infer<typeof branchSchema>;

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<BranchStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Activa', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  INACTIVE: { label: 'Inactiva', className: 'bg-muted text-muted-foreground' },
};

function StatusBadge({ status }: { status: BranchStatus }) {
  const { label, className } = statusConfig[status] ?? statusConfig.INACTIVE;
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BranchesPage() {
  const [statusFilter, setStatusFilter] = useState<BranchStatus | 'ALL'>('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [deleteBranch, setDeleteBranch] = useState<Branch | null>(null);

  const pagination = usePagination();
  const debouncedSearch = useDebounce(pagination.search, 350);

  const { data, isLoading } = useBranches({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const { mutate: createBranch, isPending: isCreating } = useCreateBranch();
  const { mutate: updateBranch, isPending: isUpdating } = useUpdateBranch();
  const { mutate: deleteBranchMutation, isPending: isDeleting } = useDeleteBranch();

  const isSaving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
    defaultValues: { status: 'ACTIVE', isMain: false },
  });

  function openCreate() {
    reset({ status: 'ACTIVE', isMain: false });
    setEditBranch(null);
    setFormOpen(true);
  }

  function openEdit(branch: Branch) {
    reset({
      name: branch.name,
      phone: branch.phone ?? '',
      email: branch.email ?? '',
      address: branch.address,
      city: branch.city,
      state: branch.state,
      zipCode: branch.zipCode ?? '',
      status: branch.status,
      isMain: branch.isMain,
      notes: branch.notes ?? '',
    });
    setEditBranch(branch);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditBranch(null);
    reset();
  }

  function onSubmit(values: BranchForm) {
    const payload = {
      ...values,
      phone: values.phone || undefined,
      email: values.email || undefined,
      zipCode: values.zipCode || undefined,
      notes: values.notes || undefined,
    };

    if (editBranch) {
      updateBranch(
        { id: editBranch.id, data: payload },
        { onSuccess: closeForm },
      );
    } else {
      createBranch(payload, { onSuccess: closeForm });
    }
  }

  const columns: ColumnDef<Branch>[] = [
    {
      id: 'name',
      header: 'Sucursal',
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm flex items-center gap-1.5">
                {b.name}
                {b.isMain && (
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-label="Principal" />
                )}
              </p>
              <p className="text-xs text-muted-foreground">{b.address}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'location',
      header: 'Ciudad / Estado',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.city}, {row.original.state}
        </span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Teléfono',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{getValue<string | null>() ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estatus',
      cell: ({ getValue }) => <StatusBadge status={getValue<BranchStatus>()} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openEdit(b)}
              aria-label="Editar sucursal"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setDeleteBranch(b)}
              aria-label="Eliminar sucursal"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sucursales"
        description="Administra las ubicaciones físicas de tu empresa."
      >
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nueva sucursal
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        totalPages={data?.pages}
        currentPage={pagination.page}
        onPageChange={pagination.setPage}
        searchValue={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder="Buscar por nombre, ciudad o estado..."
        toolbar={
          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as BranchStatus | 'ALL')}
            >
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="ACTIVE">Activas</SelectItem>
                <SelectItem value="INACTIVE">Inactivas</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {data?.total ?? 0} sucursal{data?.total !== 1 ? 'es' : ''}
            </span>
          </div>
        }
      />

      {/* Create / Edit modal */}
      <Modal
        open={formOpen}
        onOpenChange={(open) => { if (!open) closeForm(); }}
        title={editBranch ? 'Editar sucursal' : 'Nueva sucursal'}
        description={
          editBranch
            ? 'Actualiza los datos de la sucursal.'
            : 'Completa la información para registrar una nueva sucursal.'
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="br-name">Nombre de la sucursal *</Label>
            <Input id="br-name" placeholder="Sucursal Centro" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Phone + Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="br-phone">Teléfono</Label>
              <Input id="br-phone" placeholder="5512345678" {...register('phone')} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="br-email">Correo electrónico</Label>
              <Input id="br-email" type="email" placeholder="sucursal@empresa.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="br-address">Dirección *</Label>
            <Input id="br-address" placeholder="Av. Insurgentes 123, Col. Roma" {...register('address')} />
            {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
          </div>

          {/* City + State + Zip */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="br-city">Ciudad *</Label>
              <Input id="br-city" placeholder="CDMX" {...register('city')} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="br-state">Estado *</Label>
              <Input id="br-state" placeholder="CDMX" {...register('state')} />
              {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="br-zip">C.P.</Label>
              <Input id="br-zip" placeholder="06600" {...register('zipCode')} />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="br-status">Estatus</Label>
            <Select
              value={watch('status')}
              onValueChange={(v) => setValue('status', v as 'ACTIVE' | 'INACTIVE')}
            >
              <SelectTrigger id="br-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Activa</SelectItem>
                <SelectItem value="INACTIVE">Inactiva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="br-notes">Notas internas</Label>
            <textarea
              id="br-notes"
              rows={2}
              placeholder="Horario, indicaciones de acceso, etc."
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('notes')}
            />
            {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
          </div>

          {/* Is Main */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Sucursal principal</p>
              <p className="text-xs text-muted-foreground">
                Solo puede haber una sucursal principal por empresa.
              </p>
            </div>
            <Switch
              checked={watch('isMain')}
              onCheckedChange={(checked) => setValue('isMain', checked)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : editBranch ? 'Guardar cambios' : 'Registrar sucursal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteBranch}
        onOpenChange={(open) => { if (!open) setDeleteBranch(null); }}
        title={`¿Eliminar "${deleteBranch?.name}"?`}
        description="La sucursal se eliminará permanentemente. No puedes eliminar sucursales con órdenes de reparación activas."
        confirmLabel="Eliminar"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() => {
          if (deleteBranch) {
            deleteBranchMutation(deleteBranch.id, { onSuccess: () => setDeleteBranch(null) });
          }
        }}
      />
    </div>
  );
}
