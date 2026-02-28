'use client';

import { User, LogOut, Settings, CreditCard, Shield } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { formatInitials } from '@/lib/utils/formatters';

export function UserDropdown() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = formatInitials(user.firstName, user.lastName);
  const fullName = `${user.firstName} ${user.lastName}`;
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={fullName} />
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {isSuperAdmin && (
              <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-primary">
                <Shield className="h-3 w-3" />
                Super Admin
              </div>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {!isSuperAdmin && (
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings/profile">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/company">
                <Settings className="h-4 w-4" />
                Company
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/billing">
                <CreditCard className="h-4 w-4" />
                Billing
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {isSuperAdmin && (
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">
                <Shield className="h-4 w-4" />
                Admin panel
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
