'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Lock, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useChangePassword } from '@/modules/auth/hooks/useAuth';
import { usersApi } from '@/modules/users/api/usersApi';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const pwSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PwForm = z.infer<typeof pwSchema>;

export default function SecuritySettingsPage() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { mutate: changePw, isPending } = useChangePassword();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PwForm>({ resolver: zodResolver(pwSchema) });

  function onSubmit(data: PwForm) {
    changePw(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => reset() }
    );
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      toast.error('Please enter your password.');
      return;
    }
    setDeleting(true);
    try {
      await usersApi.remove(user!.id);
      logout();
      router.push('/login');
      toast.success('Account deleted.');
    } catch {
      toast.error('Incorrect password or could not delete account.');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Security" description="Manage your password and account access.">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <div className="max-w-lg space-y-6">
        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Change Password
            </CardTitle>
            <CardDescription>
              Use a strong password with letters, numbers, and symbols.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    {...register('currentPassword')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    {...register('newPassword')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={!isDirty || isPending}>
                  {isPending ? 'Saving...' : 'Update password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-4 w-4" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete my account
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setDeletePassword('');
        }}
        title="Delete your account"
        description="This action is permanent and cannot be undone. All your data will be deleted."
        confirmLabel="Delete account"
        variant="destructive"
        isLoading={deleting}
        onConfirm={handleDeleteAccount}
      >
        <div className="space-y-1.5 pt-2">
          <Label htmlFor="del-pw">Enter your password to confirm</Label>
          <Input
            id="del-pw"
            type="password"
            placeholder="Your current password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
