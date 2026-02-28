'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useSubscription } from '@/modules/billing/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface FeatureGateProps {
  /** Gate based on having an active subscription */
  requiresSubscription?: boolean;
  /** Custom message shown when feature is locked */
  message?: string;
  /** Replace children with a locked overlay (default: true) */
  overlay?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FeatureGate({
  requiresSubscription = true,
  overlay = true,
  message,
  children,
  className,
}: FeatureGateProps) {
  const { data: subscription } = useSubscription();

  const isActive = subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';
  const allowed = requiresSubscription ? isActive : true;

  if (allowed) return <>{children}</>;
  if (!overlay) return null;

  return (
    <div className={cn('relative', className)}>
      <div className="pointer-events-none select-none blur-sm opacity-50">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md bg-background/80 backdrop-blur-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {message ?? 'This feature requires an active subscription'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upgrade your plan to unlock this feature
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard/billing">View plans</Link>
        </Button>
      </div>
    </div>
  );
}
