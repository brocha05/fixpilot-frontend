'use client';

import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, UserCircle2, Phone, Mail } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from '@/modules/customers/hooks/useCustomers';
import { formatDate } from '@/lib/utils/formatters';
import type { Customer } from '@/types';

const customerSchema = z.object({
  name: z.string().min(2, 'Nombre obligatorio (mín. 2 caracteres)'),
  phone: z.string().regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos'),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useCustomers({ search, page, limit: 20 });
  const { mutate: createCustomer, isPending: creating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: updating } = useUpdateCustomer();
  const { mutate: deleteCustomerMutation, isPending: deleting } = useDeleteCustomer();

  const customers = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const createForm = useForm<CustomerFormValues>({ resolver: zodResolver(customerSchema) });
  const editForm = useForm<CustomerFormValues>({ resolver: zodResolver(customerSchema) });

  const handleCreate = (values: CustomerFormValues) => {
    createCustomer(
      { name: values.name, phone: values.phone, email: values.email || undefined },
      {
        onSuccess: () => {
          setCreateOpen(false);
          createForm.reset();
        },
      }
    );
  };

  const handleEdit = (values: CustomerFormValues) => {
    if (!editCustomer) return;
    updateCustomer(
      {
        id: editCustomer.id,
        data: { name: values.name, phone: values.phone, email: values.email || undefined },
      },
      {
        onSuccess: () => {
          setEditCustomer(null);
          editForm.reset();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteCustomer) return;
    deleteCustomerMutation(deleteCustomer.id, {
      onSuccess: () => setDeleteCustomer(null),
    });
  };

  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    editForm.reset({ name: c.name, phone: c.phone, email: c.email ?? '' });
  };

  const CustomerFormFields = ({
    form,
  }: {
    form: ReturnType<typeof useForm<CustomerFormValues>>;
  }) => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nombre completo *</Label>
        <Input placeholder="Juan Pérez García" {...form.register('name')} />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>Teléfono (10 dígitos) *</Label>
        <Input placeholder="5512345678" maxLength={10} {...form.register('phone')} />
        {form.formState.errors.phone && (
          <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>Correo electrónico (opcional)</Label>
        <Input type="email" placeholder="juan@email.com" {...form.register('email')} />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description={`${total} cliente${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}`}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, teléfono o correo..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      {/* List */}
      <Card className="overflow-hidden">
        {/* Header row */}
        <div className="hidden border-b bg-muted/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[1fr_140px_1fr_120px]">
          <span>Nombre</span>
          <span>Teléfono</span>
          <span>Correo</span>
          <span>Registrado</span>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20 ml-auto" />
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <UserCircle2 className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">
                {search ? 'No se encontraron clientes.' : 'Aún no tienes clientes registrados.'}
              </p>
              {!search && (
                <Button size="sm" onClick={() => setCreateOpen(true)} className="mt-2">
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Registrar primer cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors md:grid md:grid-cols-[1fr_140px_1fr_120px] md:items-center"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground md:hidden">{c.phone}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="hidden items-center gap-1.5 md:flex">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-sm">{c.phone}</span>
                  </div>

                  {/* Email */}
                  <div className="hidden items-center gap-1.5 md:flex">
                    {c.email ? (
                      <>
                        <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm text-muted-foreground">{c.email}</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground/40">—</span>
                    )}
                  </div>

                  {/* Date + actions */}
                  <div className="flex items-center justify-between gap-2 md:justify-start">
                    <span className="hidden text-xs text-muted-foreground md:block">
                      {formatDate(c.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="ml-auto flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => setDeleteCustomer(c)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {page} de {pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) createForm.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar nuevo cliente</DialogTitle>
          </DialogHeader>
          <CustomerFormFields form={createForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createForm.handleSubmit(handleCreate)} disabled={creating}>
              {creating ? 'Guardando...' : 'Registrar cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={(open) => !open && setEditCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          <CustomerFormFields form={editForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCustomer(null)}>
              Cancelar
            </Button>
            <Button onClick={editForm.handleSubmit(handleEdit)} disabled={updating}>
              {updating ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteCustomer} onOpenChange={(open) => !open && setDeleteCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar cliente?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de eliminar a{' '}
            <span className="font-medium text-foreground">{deleteCustomer?.name}</span>? Esta acción
            no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCustomer(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
