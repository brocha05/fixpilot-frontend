'use client';

import { User, Lock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

const sections = [
  {
    href: '/dashboard/settings/profile',
    icon: User,
    title: 'Profile',
    description: 'Update your name and personal details.',
  },
  {
    href: '/dashboard/settings/security',
    icon: Lock,
    title: 'Security',
    description: 'Change your password and manage account access.',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences." />

      <Card>
        <CardContent className="p-0">
          {sections.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 border-b px-6 py-5 transition-colors last:border-0 hover:bg-muted/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Icon className="h-5 w-5 text-foreground/70" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
