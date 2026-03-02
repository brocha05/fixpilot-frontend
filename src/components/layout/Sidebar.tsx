'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wrench,
  FolderOpen,
  Shield,
  BarChart3,
  Receipt,
  UserCircle,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function NavLink({
  href,
  label,
  icon: Icon,
  badge,
  exact,
  collapsed,
}: NavItem & { collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          isActive
            ? 'text-primary'
            : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'
        )}
      />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge !== undefined && (
        <Badge
          variant="default"
          className="h-5 min-w-[1.25rem] rounded-full px-1.5 text-[10px] font-semibold leading-none"
        >
          {badge}
        </Badge>
      )}
      {collapsed && badge !== undefined && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const userNavGroups: NavGroup[] = [
    {
      label: 'Principal',
      items: [{ href: '/dashboard', label: 'Panel', icon: LayoutDashboard, exact: true }],
    },
    {
      label: 'Taller',
      items: [
        { href: '/orders', label: 'Órdenes', icon: Wrench },
        { href: '/customers', label: 'Clientes', icon: UserCircle },
        { href: '/expenses', label: 'Gastos', icon: Receipt },
      ],
    },
    {
      label: 'Reportes',
      items: [{ href: '/analytics', label: 'Estadísticas', icon: BarChart3 }],
    },
    {
      label: 'Cuenta',
      items: [
        { href: '/dashboard/billing', label: 'Suscripción', icon: CreditCard },
        { href: '/dashboard/company', label: 'Empresa', icon: Building2 },
        { href: '/dashboard/files', label: 'Archivos', icon: FolderOpen },
        { href: '/dashboard/users', label: 'Equipo', icon: Users },
        { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
      ],
    },
  ];

  const adminNavGroups: NavGroup[] = [
    {
      label: 'Admin',
      items: [
        { href: '/admin/dashboard', label: 'Resumen', icon: BarChart3, exact: true },
        { href: '/admin/companies', label: 'Empresas', icon: Building2 },
        { href: '/admin/subscriptions', label: 'Suscripciones', icon: CreditCard },
      ],
    },
  ];

  const navGroups = isSuperAdmin ? adminNavGroups : userNavGroups;

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r bg-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-[60px]' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b px-3">
        <div
          className={cn('flex items-center gap-3 overflow-hidden', collapsed && 'justify-center')}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                {process.env.NEXT_PUBLIC_APP_NAME ?? 'FixPilot'}
              </p>
              {isSuperAdmin && <p className="text-[10px] font-medium text-primary">Super Admin</p>}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3 pt-4">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
                {group.label}
              </p>
            )}
            {collapsed && <div className="my-1 h-px bg-border/50" />}
            {group.items.map((item) => (
              <NavLink key={item.href} {...item} collapsed={collapsed} />
            ))}
          </div>
        ))}
      </nav>

      {!collapsed && isSuperAdmin && (
        <div className="border-t p-3">
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Modo Super Admin</span>
          </div>
        </div>
      )}

      {!collapsed && !isSuperAdmin && user && (
        <div className="border-t p-3">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent/60"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
            </div>
          </Link>
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-[72px] z-10 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-accent"
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
    </aside>
  );
}
