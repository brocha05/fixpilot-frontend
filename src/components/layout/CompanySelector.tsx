'use client';

import { Building2 } from 'lucide-react';
import { useCompanyStore } from '@/store/companyStore';

export function CompanySelector() {
  const { currentCompany } = useCompanyStore();

  return (
    <div className="flex items-center gap-2 px-2 text-sm font-medium">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <span className="truncate max-w-[140px]">{currentCompany?.name ?? 'No company'}</span>
    </div>
  );
}
