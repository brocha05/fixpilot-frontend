import apiClient from '@/lib/api/client';
import type { PublicTrackingData } from '@/types';

export const trackingApi = {
  getByToken: (token: string) =>
    apiClient.get<PublicTrackingData>(`/public/track/${token}`),

  /** Customer approves the repair estimate from the tracking page */
  approve: (token: string) =>
    apiClient.post<{ message: string }>(`/public/track/${token}/approve`),
};
