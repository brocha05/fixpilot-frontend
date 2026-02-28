'use client';

import { useQuery } from '@tanstack/react-query';
import { usageApi } from '../api/usageApi';

export const usageKeys = {
  all: ['usage'] as const,
  stats: () => [...usageKeys.all, 'stats'] as const,
};

export function useUsage() {
  return useQuery({
    queryKey: usageKeys.stats(),
    queryFn: () => usageApi.getStats().then((r) => r.data),
  });
}
