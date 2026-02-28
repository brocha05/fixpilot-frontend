'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/store/authStore';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth.types';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const authKeys = {
  me: ['auth', 'me'] as const,
};

// ─── useAuth ─────────────────────────────────────────────────────────────────

export function useAuth() {
  const { user, isAuthenticated, accessToken, logout: storeLogout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // silently fail — token may already be expired
    } finally {
      storeLogout();
      queryClient.clear();
      router.push('/login');
    }
  }, [storeLogout, queryClient, router]);

  return { user, isAuthenticated, accessToken, logout };
}

// ─── useLogin ────────────────────────────────────────────────────────────────

export function useLogin() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const r = await authApi.login(credentials);
      // The axios interceptor already unwraps { success, data, meta } → data
      return r.data as AuthResponse;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken, data.company);
      toast.success(`Welcome back, ${data.user.firstName}!`);
      // Redirect based on role
      if (data.user.role === 'SUPER_ADMIN') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    },
    onError: (error) => {
      console.error('[useLogin] error:', error);
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 0 || !error.response) {
          toast.error('Cannot reach the server. Check that the backend is running.');
          return;
        }
        if (status === 401 || status === 400) {
          toast.error('Invalid email or password.');
          return;
        }
        toast.error(`Server error ${status}. Check the browser console for details.`);
        return;
      }
      toast.error(`Unexpected error: ${(error as Error).message}`);
    },
  });
}

// ─── useRegister ─────────────────────────────────────────────────────────────

export function useRegister() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: RegisterRequest) => {
      const r = await authApi.register(credentials);
      return r.data as AuthResponse;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken, data.company);
      toast.success('Account created successfully!');
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error('An account with this email already exists.');
        return;
      }
      toast.error('Could not create account. Please try again.');
    },
  });
}

// ─── useCurrentUser ───────────────────────────────────────────────────────────

export function useCurrentUser() {
  const { isAuthenticated, setUser } = useAuthStore();

  const query = useQuery({
    queryKey: authKeys.me,
    queryFn: () => authApi.getMe().then((r) => r.data),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);

  return query;
}

// ─── useChangePassword ────────────────────────────────────────────────────────

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => toast.success('Password updated successfully.'),
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        toast.error('Current password is incorrect.');
        return;
      }
      toast.error('Failed to update password.');
    },
  });
}

// ─── useForgotPassword ────────────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () =>
      toast.success("If that email exists, you'll receive reset instructions shortly."),
    onError: () => toast.error('Failed to send reset email.'),
  });
}

// ─── useResetPassword ─────────────────────────────────────────────────────────

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Password reset successfully. Please log in.');
      router.push('/login');
    },
    onError: () => toast.error('Invalid or expired reset token.'),
  });
}

// ─── useAcceptInvite ──────────────────────────────────────────────────────────

export function useAcceptInvite() {
  const { setAuth } = useAuthStore();
  return useMutation({
    mutationFn: async (data: {
      token: string;
      firstName: string;
      lastName: string;
      password: string;
    }) => {
      const r = await authApi.acceptInvite(
        data.token,
        data.firstName,
        data.lastName,
        data.password
      );
      return r.data as AuthResponse;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken, data.company);
      toast.success('Welcome! Your account has been created.');
      window.location.href = '/dashboard';
    },
    onError: () => toast.error('Invalid or expired invitation link.'),
  });
}
