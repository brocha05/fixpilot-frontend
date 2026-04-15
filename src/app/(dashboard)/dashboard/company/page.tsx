'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Upload, Users, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  useCurrentCompany,
  useUpdateCompany,
  useUploadLogo,
  useCompanyMembers,
} from '@/modules/company/hooks/useCompany';
import { companyApi } from '@/modules/company/api/companyApi';
import { useAuthStore } from '@/store/authStore';
import { formatDate, formatInitials } from '@/lib/utils/formatters';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const schema = z.object({ name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres') });
type FormData = z.infer<typeof schema>;

export default function CompanyPage() {
  const { data: company, isLoading } = useCurrentCompany();
  const { data: members, isLoading: membersLoading } = useCompanyMembers();
  const { mutate: update, isPending: updating } = useUpdateCompany();
  const { mutate: uploadLogo, isPending: uploadingLogo } = useUploadLogo();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const router = useRouter();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (company) reset({ name: company.name });
  }, [company, reset]);

  async function handleDeleteCompany() {
    setDeleting(true);
    try {
      await companyApi.delete();
      toast.success('Empresa eliminada.');
      router.push('/login');
    } catch {
      toast.error('No se pudo eliminar la empresa.');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Empresa" description="Administra el perfil y configuración de tu empresa." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: settings */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Perfil de Empresa
              </CardTitle>
              <CardDescription>Actualiza el nombre y logo de tu empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-muted">
                  {company?.logoUrl ? (
                    <Image src={company.logoUrl} alt="Logo de empresa" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <div className="space-y-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => logoRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingLogo ? 'Subiendo...' : 'Subir logo'}
                    </Button>
                    <p className="text-xs text-muted-foreground">PNG, JPG hasta 5 MB</p>
                    <input
                      ref={logoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadLogo(file);
                        e.target.value = '';
                      }}
                    />
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit((d) => update(d))} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="co-name">Nombre de empresa</Label>
                    <Input id="co-name" {...register('name')} disabled={!isAdmin} />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <Input
                      value={company?.slug ?? ''}
                      disabled
                      className="bg-muted/50 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Usado en URLs — contacta soporte para cambiar.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Creado</Label>
                    <Input
                      value={company?.createdAt ? formatDate(company.createdAt) : ''}
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                  {isAdmin && (
                    <div className="flex justify-end">
                      <Button type="submit" disabled={!isDirty || updating}>
                        {updating ? 'Guardando...' : 'Guardar cambios'}
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <ShieldAlert className="h-4 w-4" />
                  Zona de Peligro
                </CardTitle>
                <CardDescription>Elimina permanentemente esta empresa y todos sus datos.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                  Eliminar empresa
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Miembros
            </CardTitle>
            <CardDescription>
              {membersLoading
                ? '—'
                : `${members?.length ?? 0} miembro${members?.length !== 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {membersLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 border-b px-6 py-3 last:border-0">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                ))
              : members?.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 border-b px-6 py-3 last:border-0"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {formatInitials(m.firstName, m.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {m.firstName} {m.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <Badge
                      variant={m.role === 'ADMIN' ? 'default' : 'secondary'}
                      className="shrink-0 text-xs capitalize"
                    >
                      {m.role.toLowerCase()}
                    </Badge>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar empresa"
        description="Todos los usuarios, datos y archivos serán eliminados permanentemente. Esta acción no se puede deshacer."
        confirmLabel="Eliminar empresa"
        variant="destructive"
        isLoading={deleting}
        onConfirm={handleDeleteCompany}
      />
    </div>
  );
}
