'use client';

import { useQuery } from '@tanstack/react-query';
import { getMe } from './api';
import type { User } from './types';

export const meQueryKey = ['me'] as const;

/**
 * Reactive access to the current user. Seeded with `initialData` from the
 * server render so there's no auth flash, but stays live so a logout or
 * session change updates the whole UI.
 */
export function useMe(initialData?: User) {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: getMe,
    initialData,
    retry: false,
  });
}
