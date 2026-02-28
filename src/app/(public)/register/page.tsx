import type { Metadata } from 'next';
import { Zap } from 'lucide-react';
import { RegisterForm } from '@/modules/auth/components/RegisterForm';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start your 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
