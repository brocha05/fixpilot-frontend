'use client';

import { useState } from 'react';
import { Plus, X, ShoppingCart, Ban } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { PageHeader } from '@/components/shared/PageHeader';
import { MoneyDisplay } from '@/components/shared/MoneyDisplay';
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
import { Skeleton } from '@/components/ui/skeleton';

import { useSales, useCreateSale, useCancelSale } from '@/modules/sales/hooks/useSales';
import { useProducts } from '@/modules/inventory/hooks/useInventory';
import { formatMXN } from '@/lib/utils/formatters';
import type { Sale, SaleStatus, PaymentMethod } from '@/types';

// ─── Labels ───────────────────────────────────────────────────────────────────

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  OTHER: 'Otro',
};

const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Devuelta',
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const colors: Record<SaleStatus, string> = {
    COMPLETED: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    CANCELLED: 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    REFUNDED: 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  };
  return (
    <Badge variant="outline" className={colors[status]}>
      {SALE_STATUS_LABELS[status]}
    </Badge>
  );
}

// ─── New Sale Form ────────────────────────────────────────────────────────────

interface LineItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

const saleSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER', 'OTHER']),
  discount: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
});

type SaleFormValues = z.infer<typeof saleSchema>;

function NewSaleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createSale = useCreateSale();
  const { data: productsData } = useProducts({ status: 'ACTIVE', limit: 200 });
  const products = productsData?.data ?? [];

  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: 1, unitPrice: 0 }]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<SaleFormValues>({
      resolver: zodResolver(saleSchema),
      defaultValues: { paymentMethod: 'CASH', discount: 0 },
    });

  const discount = Number(watch('discount') ?? 0);
  const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const finalAmount = Math.max(0, totalAmount - discount);

  const addItem = () => setItems((prev) => [...prev, { productId: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleProductChange = (idx: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, productId, unitPrice: product?.price ?? 0 } : item,
      ),
    );
  };

  const handleQuantityChange = (idx: number, qty: number) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, quantity: Math.max(1, qty) } : item)));
  };

  const handlePriceChange = (idx: number, price: number) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, unitPrice: Math.max(0, price) } : item)));
  };

  const handleClose = () => {
    reset();
    setItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
    onClose();
  };

  const onSubmit = async (values: SaleFormValues) => {
    const validItems = items.filter((i) => i.productId);
    if (validItems.length === 0) return;

    await createSale.mutateAsync({
      items: validItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      paymentMethod: values.paymentMethod,
      discount: values.discount,
      notes: values.notes || undefined,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva venta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Line items */}
          <div className="space-y-2">
            <Label>Artículos *</Label>
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-center">
                <Select value={item.productId} onValueChange={(v) => handleProductChange(idx, v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Seleccionar producto…" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id} disabled={p.stock === 0}>
                        {p.name}
                        {p.sku ? ` (${p.sku})` : ''}
                        {p.stock === 0 ? ' — sin stock' : ` — ${p.stock} disp.`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                  className="h-9 text-center"
                  placeholder="Cant."
                />

                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={item.unitPrice}
                  onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                  className="h-9 text-right"
                  placeholder="Precio"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-8 shrink-0"
                  disabled={items.length === 1}
                  onClick={() => removeItem(idx)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Agregar artículo
            </Button>
          </div>

          {/* Totals */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMXN(totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Descuento</span>
              <Input
                type="number"
                step="0.01"
                min={0}
                {...register('discount')}
                className="h-7 w-28 text-right text-sm"
              />
            </div>
            <div className="flex justify-between border-t pt-1 font-semibold">
              <span>Total</span>
              <span>{formatMXN(finalAmount)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Método de pago *</Label>
              <Select
                defaultValue="CASH"
                onValueChange={(v) => setValue('paymentMethod', v as PaymentMethod)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(PAYMENT_LABELS) as [PaymentMethod, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes">Notas</Label>
              <Input id="notes" {...register('notes')} placeholder="Comentario opcional" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button
              type="submit"
              disabled={createSale.isPending || items.every((i) => !i.productId)}
            >
              {createSale.isPending ? 'Registrando…' : `Registrar venta · ${formatMXN(finalAmount)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Cancel Confirm ───────────────────────────────────────────────────────────

function CancelSaleDialog({
  sale,
  onClose,
}: {
  sale: Sale | null;
  onClose: () => void;
}) {
  const cancelSale = useCancelSale();

  return (
    <Dialog open={!!sale} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancelar venta</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          ¿Cancelar esta venta por{' '}
          <span className="font-medium text-foreground">{sale ? formatMXN(sale.finalAmount) : ''}</span>?
          El stock de todos los artículos será restaurado.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>No</Button>
          <Button
            variant="destructive"
            disabled={cancelSale.isPending}
            onClick={async () => {
              if (!sale) return;
              await cancelSale.mutateAsync(sale.id);
              onClose();
            }}
          >
            {cancelSale.isPending ? 'Cancelando…' : 'Cancelar venta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalesPage() {
  const [statusFilter, setStatusFilter] = useState<SaleStatus | 'ALL'>('ALL');
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [cancelSale, setCancelSale] = useState<Sale | null>(null);

  const params = {
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    limit: 50,
  };

  const { data, isLoading } = useSales(params);
  const sales = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas"
        description="Registro de ventas de productos del inventario."
        action={
          <Button onClick={() => setNewSaleOpen(true)} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Nueva venta
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as SaleStatus | 'ALL')}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estatus</SelectItem>
            <SelectItem value="COMPLETED">Completadas</SelectItem>
            <SelectItem value="CANCELLED">Canceladas</SelectItem>
            <SelectItem value="REFUNDED">Devueltas</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto text-sm text-muted-foreground">
          {total} {total === 1 ? 'venta' : 'ventas'}
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0 divide-y">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No hay ventas registradas.</p>
              <Button size="sm" onClick={() => setNewSaleOpen(true)} className="mt-1">
                Registrar primera venta
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-muted-foreground">
                    <th className="px-6 py-3 text-left font-medium">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium">Artículos</th>
                    <th className="px-4 py-3 text-left font-medium">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium">Pago</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 text-center font-medium">Estatus</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-6 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(sale.createdAt).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="truncate max-w-[220px]">
                          {sale.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {sale.customer?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {PAYMENT_LABELS[sale.paymentMethod]}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        <MoneyDisplay amount={sale.finalAmount} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <SaleStatusBadge status={sale.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {sale.status === 'COMPLETED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => setCancelSale(sale)}
                          >
                            <Ban className="h-3 w-3" />
                            Cancelar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <NewSaleModal open={newSaleOpen} onClose={() => setNewSaleOpen(false)} />
      <CancelSaleDialog sale={cancelSale} onClose={() => setCancelSale(null)} />
    </div>
  );
}
