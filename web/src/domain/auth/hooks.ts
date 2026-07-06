'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login, logout } from './api';
import { meQueryKey } from '@/domain/user/hooks';

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      // Prime the cache so the app shell has the user immediately, then
      // navigate. The server layout re-validates via the cookie on arrival.
      queryClient.setQueryData(meQueryKey, user);
      router.replace('/');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      router.replace('/login');
    },
  });
}
