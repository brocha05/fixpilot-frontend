import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Company } from '@/types';

interface CompanyState {
  currentCompanyId: string | null;
  currentCompany: Company | null;
}

interface CompanyActions {
  setCurrentCompany: (company: Company) => void;
  updateCurrentCompany: (data: Partial<Company>) => void;
  clearCompany: () => void;
}

type CompanyStore = CompanyState & CompanyActions;

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      currentCompanyId: null,
      currentCompany: null,

      setCurrentCompany: (company) =>
        set({ currentCompany: company, currentCompanyId: company.id }),

      updateCurrentCompany: (data) =>
        set((state) => ({
          currentCompany: state.currentCompany ? { ...state.currentCompany, ...data } : null,
        })),

      clearCompany: () => set({ currentCompanyId: null, currentCompany: null }),
    }),
    {
      name: 'company-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
    }
  )
);
