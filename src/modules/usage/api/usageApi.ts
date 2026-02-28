import apiClient from '@/lib/api/client';
import type { UsageStats } from '@/types';

export const usageApi = {
  getStats: () => apiClient.get<UsageStats>('/usage'),
};
