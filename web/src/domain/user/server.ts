import 'server-only';
import { serverFetch } from '@/api/server';
import type { User } from './types';

/**
 * Server-only: fetch the current user for SSR route-gating. Returns `null`
 * instead of throwing on 401 so layouts can branch on auth cleanly. The
 * `server-only` import makes it a build error to pull this into a client bundle.
 */
export async function getMeServer(): Promise<User | null> {
  const res = await serverFetch('/me');
  if (!res.ok) return null;
  return (await res.json()) as User;
}
