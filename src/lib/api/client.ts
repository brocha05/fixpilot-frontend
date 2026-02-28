import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { env } from '@/lib/config/env';

// We use lazy imports to avoid circular dependency issues with Zustand stores
const getAuthState = () => import('@/store/authStore').then((m) => m.useAuthStore.getState());

const getCompanyState = () =>
  import('@/store/companyStore').then((m) => m.useCompanyStore.getState());

const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request interceptor ────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const auth = await getAuthState();
    const company = await getCompanyState();

    if (auth.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }

    if (company.currentCompanyId) {
      config.headers['X-Company-Id'] = company.currentCompanyId;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response interceptor — token refresh ───────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwrap backend's ResponseInterceptor envelope: { success: true, data: T, meta: {...} }
    if (
      response.data !== null &&
      typeof response.data === 'object' &&
      response.data.success === true &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401, and not on the refresh endpoint itself
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken, setTokens, logout } = await getAuthState();

    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }

    try {
      const { data: body } = await axios.post<{
        data: { accessToken: string; refreshToken: string };
      }>(`${env.API_URL}/auth/refresh`, { refreshToken });

      const data = body.data ?? body;
      setTokens(data.accessToken, data.refreshToken);
      processQueue(null, data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
