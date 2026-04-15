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
      toast.success(`¡Bienvenido, ${data.user.firstName}!`);
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
          toast.error('No se puede conectar al servidor. Verifica que el backend esté en ejecución.');
          return;
        }
        if (status === 401 || status === 400) {
          toast.error('Correo o contraseña inválidos.');
          return;
        }
        toast.error(`Error del servidor ${status}. Revisa la consola del navegador.`);
        return;
      }
      toast.error(`Error inesperado: ${(error as Error).message}`);
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
      toast.success('¡Cuenta creada exitosamente!');
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error('Ya existe una cuenta con este correo.');
        return;
      }
      toast.error('No se pudo crear la cuenta. Intenta de nuevo.');
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
    onSuccess: () => toast.success('Contraseña actualizada exitosamente.'),
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        toast.error('La contraseña actual es incorrecta.');
        return;
      }
      toast.error('No se pudo actualizar la contraseña.');
    },
  });
}

// ─── useForgotPassword ────────────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () =>
      toast.success('Si ese correo existe, recibirás instrucciones para restablecer tu contraseña en breve.'),
    onError: () => toast.error('No se pudo enviar el correo de restablecimiento.'),
  });
}

// ─── useResetPassword ─────────────────────────────────────────────────────────

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Contraseña restablecida exitosamente. Por favor inicia sesión.');
      router.push('/login');
    },
    onError: () => toast.error('Token de restablecimiento inválido o expirado.'),
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
      toast.success('¡Bienvenido! Tu cuenta ha sido creada.');
      window.location.href = '/dashboard';
    },
    onError: () => toast.error('Enlace de invitación inválido o expirado.'),
  });
}
