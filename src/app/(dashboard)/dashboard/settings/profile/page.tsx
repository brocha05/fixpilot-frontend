'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMe, useUpdateMe } from '@/modules/users/hooks/useUsers';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});
type FormData = z.infer<typeof schema>;

export default function ProfileSettingsPage() {
  const { data: me, isLoading } = useMe();
  const { mutate: update, isPending } = useUpdateMe();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (me) reset({ firstName: me.firstName, lastName: me.lastName });
  }, [me, reset]);

  function onSubmit(data: FormData) {
    update(data);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Update your personal information.">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <div className="max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>Your name is visible to other team members.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && (
                      <p className="text-xs text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && (
                      <p className="text-xs text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Email address</Label>
                  <Input value={me?.email ?? ''} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email address.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Input value={me?.role ?? ''} disabled className="bg-muted/50 capitalize" />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={!isDirty || isPending}>
                    <Save className="h-4 w-4" />
                    {isPending ? 'Saving...' : 'Save changes'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
