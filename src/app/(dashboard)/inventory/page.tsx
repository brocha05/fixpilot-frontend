'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/modules/inventory/hooks/useInventory';
import { formatMXN } from '@/lib/utils/formatters';
import type { Product, ProductStatus } from '@/types';

// ─── Form Schema ──────────────────────────────────────────────────────────────

const toNum = z.preprocess((v) => (v === '' || v === null ? undefined : Number(v)), z.number().optional());
const toReqNum = z.preprocess((v) => Number(v), z.number().min(0, 'El precio no puede ser negativo'));

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().max(500).optional().or(z.literal('')),
  sku: z.string().max(100).optional().or(z.literal('')),
  category: z.string().max(100).optional().or(z.literal('')),
  price: toReqNum,
  cost: toNum,
  stock: z.preprocess((v) => (v === '' || v === null ? undefined : Number(v)), z.number().int().min(0).optional()),
  minStock: z.preprocess((v) => (v === '' || v === null ? undefined : Number(v)), z.number().int().min(0).optional()),
  unit: z.string().max(20).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// ─── Status Badge ─────────────────────────────────────────────────────────────

function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge
      variant="outline"
      className={
        status === 'ACTIVE'
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
          : 'border-slate-300 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
      }
    >
      {status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
    </Badge>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

interface ProductModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

function ProductModal({ open, product, onClose }: ProductModalProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      sku: product?.sku ?? '',
      category: product?.category ?? '',
      price: product?.price ?? 0,
      cost: product?.cost ?? 0,
      stock: product?.stock ?? 0,
      minStock: product?.minStock ?? 0,
      unit: product?.unit ?? 'pza',
      status: (product?.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
    },
  });

  const status = watch('status');

  const onSubmit = async (values: ProductFormValues) => {
    const payload = {
      ...values,
      description: values.description || undefined,
      sku: values.sku || undefined,
      category: values.category || undefined,
      unit: values.unit || 'pza',
    };

    if (isEdit) {
      await updateProduct.mutateAsync({ id: product.id, data: payload });
    } else {
      await createProduct.mutateAsync(payload);
    }
    reset();
    onClose();
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" {...register('name')} placeholder="Pantalla iPhone 13" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register('sku')} placeholder="PANT-IP13" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="category">Categoría</Label>
              <Input id="category" {...register('category')} placeholder="Pantallas" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="price">Precio de venta *</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} placeholder="1200.00" />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="cost">Costo</Label>
              <Input id="cost" type="number" step="0.01" {...register('cost')} placeholder="800.00" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="stock">Stock actual</Label>
              <Input id="stock" type="number" {...register('stock')} placeholder="10" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="minStock">Stock mínimo</Label>
              <Input id="minStock" type="number" {...register('minStock')} placeholder="3" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="unit">Unidad</Label>
              <Input id="unit" {...register('unit')} placeholder="pza" />
            </div>

            <div className="space-y-1">
              <Label>Estatus</Label>
              <Select
                value={status}
                onValueChange={(v) => setValue('status', v as 'ACTIVE' | 'INACTIVE')}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                {...register('description')}
                rows={2}
                placeholder="Descripción opcional del producto"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────

function ConfirmDeleteDialog({
  open,
  product,
  onClose,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}) {
  const deleteProduct = useDeleteProduct();

  const handleConfirm = async () => {
    if (!product) return;
    await deleteProduct.mutateAsync(product.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Eliminar producto</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          ¿Estás seguro de que deseas eliminar{' '}
          <span className="font-medium text-foreground">{product?.name}</span>? Esta acción no se puede deshacer.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            variant="destructive"
            disabled={deleteProduct.isPending}
            onClick={handleConfirm}
          >
            {deleteProduct.isPending ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'ALL'>('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const params = {
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    lowStock: lowStockOnly || undefined,
    limit: 50,
  };

  const { data, isLoading } = useProducts(params);
  const products = data?.data ?? [];
  const total = data?.total ?? 0;

  const openCreate = () => { setEditProduct(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setModalOpen(true); };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario"
        description="Gestiona tus productos y existencias."
        action={
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Nuevo producto
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por nombre, SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-60"
        />

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as ProductStatus | 'ALL')}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="ACTIVE">Activo</SelectItem>
            <SelectItem value="INACTIVE">Inactivo</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={lowStockOnly ? 'default' : 'outline'}
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => setLowStockOnly((v) => !v)}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Stock bajo
        </Button>

        <span className="ml-auto text-sm text-muted-foreground">
          {total} {total === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0 divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-20 ml-auto" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <Package className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No hay productos{search ? ' con esa búsqueda' : ''}.</p>
              <Button size="sm" onClick={openCreate} className="mt-1">
                Agregar primer producto
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-muted-foreground">
                    <th className="px-6 py-3 text-left font-medium">Producto</th>
                    <th className="px-4 py-3 text-left font-medium">Categoría</th>
                    <th className="px-4 py-3 text-right font-medium">Precio</th>
                    <th className="px-4 py-3 text-right font-medium">Costo</th>
                    <th className="px-4 py-3 text-center font-medium">Stock</th>
                    <th className="px-4 py-3 text-center font-medium">Estatus</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.sku && (
                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {product.category ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatMXN(product.price)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatMXN(product.cost)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            product.isLowStock
                              ? 'inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400'
                              : 'text-sm'
                          }
                        >
                          {product.isLowStock && <AlertTriangle className="h-3 w-3" />}
                          {product.stock} {product.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ProductStatusBadge status={product.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="sr-only">Acciones</span>
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(product)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteProduct(product)}
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductModal
        open={modalOpen}
        product={editProduct}
        onClose={() => { setModalOpen(false); setEditProduct(null); }}
      />

      <ConfirmDeleteDialog
        open={!!deleteProduct}
        product={deleteProduct}
        onClose={() => setDeleteProduct(null)}
      />
    </div>
  );
}
