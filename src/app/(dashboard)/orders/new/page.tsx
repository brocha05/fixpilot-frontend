'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateRepairOrder } from '@/modules/repairs/hooks/useRepairs';
import { useCustomers, useCreateCustomer } from '@/modules/customers/hooks/useCustomers';
import { URGENCY_LABELS } from '@/modules/repairs/types/repairs.types';
import type { Customer, UrgencyLevel } from '@/types';

const schema = z.object({
  deviceModel: z.string().min(1, 'El modelo del equipo es obligatorio').max(200),
  issueDescription: z.string().min(5, 'Describe el problema (mín. 5 caracteres)').max(2000),
  urgencyLevel: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  costEstimate: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().positive('Debe ser mayor a 0').optional()
  ),
});

const customerSchema = z.object({
  name: z.string().min(2, 'Nombre obligatorio'),
  phone: z.string().regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos'),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;
type CustomerFormValues = z.infer<typeof customerSchema>;

export default function NewOrderPage() {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const { data: customersData } = useCustomers({ search: customerSearch, limit: 10 });
  const { mutate: createOrder, isPending: creating } = useCreateRepairOrder();
  const { mutate: createCustomer, isPending: creatingCustomer } = useCreateCustomer();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { urgencyLevel: 'NORMAL' },
  });
  const customerForm = useForm<CustomerFormValues>({ resolver: zodResolver(customerSchema) });

  const onCreateCustomer = (data: CustomerFormValues) => {
    createCustomer(
      { name: data.name, phone: data.phone, email: data.email || undefined },
      {
        onSuccess: (customer) => {
          setSelectedCustomer(customer);
          setShowNewCustomer(false);
          customerForm.reset();
        },
      }
    );
  };

  const onSubmit = (data: FormValues) => {
    if (!selectedCustomer) return;
    createOrder(
      { ...data, customerId: selectedCustomer.id },
      { onSuccess: (order) => router.push(`/orders/${order.id}`) }
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title="Nueva orden de reparación"
          description="Completa los datos del dispositivo y del cliente."
        />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCustomer ? (
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div>
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                  {selectedCustomer.email && (
                    <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                  Cambiar
                </Button>
              </div>
            ) : showNewCustomer ? (
              <div className="space-y-4 rounded-lg border p-4">
                <p className="text-sm font-medium">Nuevo cliente</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Nombre completo *</Label>
                    <Input placeholder="Juan Pérez García" {...customerForm.register('name')} />
                    {customerForm.formState.errors.name && (
                      <p className="text-xs text-destructive">
                        {customerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Teléfono (10 dígitos) *</Label>
                    <Input
                      placeholder="5512345678"
                      maxLength={10}
                      {...customerForm.register('phone')}
                    />
                    {customerForm.formState.errors.phone && (
                      <p className="text-xs text-destructive">
                        {customerForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Correo electrónico (opcional)</Label>
                    <Input
                      type="email"
                      placeholder="juan@email.com"
                      {...customerForm.register('email')}
                    />
                    {customerForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {customerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={customerForm.handleSubmit(onCreateCustomer)}
                    disabled={creatingCustomer}
                  >
                    {creatingCustomer ? 'Guardando...' : 'Guardar cliente'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewCustomer(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente por nombre o teléfono..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {customerSearch && customersData?.data?.length ? (
                  <div className="rounded-lg border divide-y overflow-hidden">
                    {customersData.data.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerSearch('');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : customerSearch && !customersData?.data?.length ? (
                  <p className="text-sm text-muted-foreground px-1">
                    No se encontró ningún cliente.
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewCustomer(true)}
                >
                  + Registrar nuevo cliente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dispositivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Modelo del equipo *</Label>
              <Input
                placeholder="iPhone 14 Pro, Samsung Galaxy S23..."
                {...form.register('deviceModel')}
              />
              {form.formState.errors.deviceModel && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.deviceModel.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Descripción del problema *</Label>
              <textarea
                {...form.register('issueDescription')}
                rows={3}
                placeholder="Describe el problema reportado por el cliente..."
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {form.formState.errors.issueDescription && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.issueDescription.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Urgencia</Label>
                <Select
                  defaultValue="NORMAL"
                  onValueChange={(v) => form.setValue('urgencyLevel', v as UrgencyLevel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(URGENCY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Costo estimado (MXN)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  {...form.register('costEstimate')}
                />
                {form.formState.errors.costEstimate && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.costEstimate.message as string}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/orders">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={creating || !selectedCustomer}>
            {creating ? 'Creando...' : 'Crear orden'}
          </Button>
        </div>
      </form>
    </div>
  );
}
