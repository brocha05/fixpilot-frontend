'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '../api/usersApi';
import { authApi } from '@/modules/auth/api/authApi';
import { toastApiError } from '@/lib/utils/apiError';
import { useAuthStore } from '@/store/authStore';
import type { CreateUserRequest, UpdateUserRequest, UsersQueryParams } from '../types/users.types';

export const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UsersQueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useMe() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => authApi.getMe().then((r) => r.data),
    enabled: isAuthenticated,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  return useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string }) =>
      usersApi.update(user!.id, data).then((r) => r.data),
    onSuccess: (updated) => {
      queryClient.setQueryData(userKeys.me(), updated);
      setUser(updated);
      toast.success('Profile updated.');
    },
    onError: () => toast.error('Failed to update profile.'),
  });
}

export function useUsers(params?: UsersQueryParams) {
  return useQuery({
    queryKey: userKeys.list(params ?? {}),
    queryFn: () => usersApi.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('User invited successfully.');
    },
    onError: (error: unknown) => toastApiError(error, 'Failed to invite user.'),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.update(id, data).then((r) => r.data),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(user.id), user);
      toast.success('User updated.');
    },
    onError: () => toast.error('Failed to update user.'),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('User removed.');
    },
    onError: () => toast.error('Failed to remove user.'),
  });
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (id: string) => usersApi.resendInvite(id),
    onSuccess: () => toast.success('Invitation resent.'),
    onError: () => toast.error('Failed to resend invitation.'),
  });
}
