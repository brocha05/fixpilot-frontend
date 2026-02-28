import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

export const metadata: Metadata = { title: 'Pricing' };

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for trying out the platform.',
    features: ['Up to 3 users', '1 company', 'Basic dashboard', 'Community support'],
    cta: 'Get started',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: 29,
    description: 'Great for small teams getting started.',
    features: ['Up to 10 users', '1 company', 'Analytics', 'API access', 'Email support'],
    cta: 'Start free trial',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 79,
    description: 'For growing teams that need more power.',
    features: [
      'Up to 50 users',
      '3 companies',
      'Advanced analytics',
      'Custom domain',
      'Audit logs',
      'Priority support',
    ],
    cta: 'Start free trial',
    href: '/register',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: null,
    description: 'For large companies with custom needs.',
    features: [
      'Unlimited users',
      'Unlimited companies',
      'SSO / SAML',
      'Dedicated support',
      'SLA guarantee',
      'Custom contracts',
    ],
    cta: 'Contact sales',
    href: '/contact',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-24 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start for free. Upgrade as your team grows. Cancel anytime.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              'relative rounded-2xl border p-6 shadow-sm flex flex-col',
              plan.highlighted && 'border-primary shadow-lg shadow-primary/10 bg-primary/5'
            )}
          >
            {plan.highlighted && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-4">
                {plan.price === null ? (
                  <span className="text-3xl font-bold">Custom</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold">${plan.price}</span>
                    {plan.price > 0 && <span className="text-muted-foreground">/mo</span>}
                  </>
                )}
              </div>
            </div>

            <ul className="flex-1 space-y-3 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button className="w-full" variant={plan.highlighted ? 'default' : 'outline'} asChild>
              <Link href={plan.href}>{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
