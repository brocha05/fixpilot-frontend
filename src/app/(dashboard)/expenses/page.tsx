'use client';

import { useState } from 'react';
import { Plus, Trash2, Receipt, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  useExpenses,
  useCreateExpense,
  useDeleteExpense,
} from '@/modules/expenses/hooks/useExpenses';
import { formatDate, formatMXN } from '@/lib/utils/formatters';
import type { ExpenseCategory } from '@/types';

const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  PARTS: 'Refacciones',
  TOOLS: 'Herramientas',
  SHIPPING: 'Envíos',
  UTILITIES: 'Servicios',
  SALARIES: 'Salarios',
  RENT: 'Renta',
  MARKETING: 'Marketing',
  OTHER: 'Otros',
};

const ALL_CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  PARTS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  TOOLS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  SHIPPING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  UTILITIES: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  SALARIES: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  RENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  MARKETING: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  OTHER: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const expenseSchema = z.object({
  description: z.string().min(2, 'Descripción obligatoria'),
  amount: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().positive('Debe ser mayor a 0')
  ),
  category: z.enum([
    'PARTS', 'TOOLS', 'SHIPPING', 'UTILITIES', 'SALARIES', 'RENT', 'MARKETING', 'OTHER',
  ]),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function ExpensesPage() {
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteExpense, setDeleteExpense] = useState<{ id: string; description: string } | null>(null);

  const { data, isLoading } = useExpenses({
    page,
    limit: 20,
    category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
  });
  const { mutate: createExpense, isPending: creating } = useCreateExpense();
  const { mutate: deleteExpenseMutation, isPending: deleting } = useDeleteExpense();

  const expenses = data?.data ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const form = useForm<ExpenseFormValues>({ resolver: zodResolver(expenseSchema) });

  const handleCreate = (values: ExpenseFormValues) => {
    createExpense(
      { description: values.description, amount: values.amount as number, category: values.category },
      {
        onSuccess: () => {
          setShowAdd(false);
          form.reset();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteExpense) return;
    deleteExpenseMutation(deleteExpense.id, {
      onSuccess: () => setDeleteExpense(null),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos"
        description={`${total} gasto${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}`}
        action={
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo gasto
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={categoryFilter}
          onValueChange={(v) => { setCategoryFilter(v as ExpenseCategory | 'ALL'); setPage(1); }}
        >
          <SelectTrigger className="w-[190px]">
            <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las categorías</SelectItem>
            {ALL_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {EXPENSE_CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {categoryFilter !== 'ALL' && (
          <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter('ALL'); setPage(1); }}>
            Limpiar filtro
          </Button>
        )}

        {expenses.length > 0 && (
          <div className="ml-auto text-sm text-muted-foreground">
            Subtotal:{' '}
            <span className="font-semibold text-foreground">{formatMXN(totalAmount)}</span>
          </div>
        )}
      </div>

      {/* List */}
      <Card className="overflow-hidden">
        <div className="hidden border-b bg-muted/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[1fr_140px_120px_100px_48px]">
          <span>Descripción</span>
          <span>Categoría</span>
          <span>Monto</span>
          <span>Fecha</span>
          <span />
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-5 w-24 ml-auto" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Receipt className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">
                {categoryFilter !== 'ALL'
                  ? 'Sin gastos en esta categoría.'
                  : 'Aún no has registrado gastos.'}
              </p>
              {categoryFilter === 'ALL' && (
                <Button size="sm" onClick={() => setShowAdd(true)} className="mt-2">
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Registrar primer gasto
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {expenses.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors md:grid md:grid-cols-[1fr_140px_120px_100px_48px] md:items-center"
                >
                  {/* Description */}
                  <p className="truncate text-sm font-medium">{e.description}</p>

                  {/* Category badge */}
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[e.category]}`}
                  >
                    {EXPENSE_CATEGORY_LABELS[e.category]}
                  </span>

                  {/* Amount */}
                  <MoneyDisplay amount={e.amount} negative size="sm" />

                  {/* Date */}
                  <span className="hidden text-xs text-muted-foreground md:block">
                    {formatDate(e.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-8 w-8 p-0 text-destructive hover:text-destructive md:ml-0"
                    onClick={() => setDeleteExpense({ id: e.id, description: e.description })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Página {page} de {pages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Add Expense Dialog */}
      <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) form.reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar nuevo gasto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Descripción *</Label>
              <Input placeholder="Pantalla iPhone 14..." {...form.register('description')} />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Monto (MXN) *</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                {...form.register('amount')}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.amount.message as string}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Categoría *</Label>
              <Select onValueChange={(v) => form.setValue('category', v as ExpenseCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {EXPENSE_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancelar
            </Button>
            <Button onClick={form.handleSubmit(handleCreate)} disabled={creating}>
              {creating ? 'Guardando...' : 'Registrar gasto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteExpense} onOpenChange={(open) => !open && setDeleteExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar gasto?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de eliminar{' '}
            <span className="font-medium text-foreground">"{deleteExpense?.description}"</span>?
            Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteExpense(null)}>
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
