import 'server-only';
import { serverFetch } from '@/api/server';
import type { InvitationDetail, InvitationSummary } from './types';

/**
 * Server-only fetchers for the SSR first frame. The detail fetch is where the
 * disclosure guarantee is strongest: the server decides whether
 * `protectedDetails` is in the payload, so it's never in the HTML or props of a
 * non-accepted firm's page.
 */

export async function getInboxServer(): Promise<InvitationSummary[]> {
  const res = await serverFetch('/invitations');
  if (!res.ok) return [];
  return (await res.json()) as InvitationSummary[];
}

export async function getInvitationServer(
  id: string,
): Promise<InvitationDetail | null> {
  const res = await serverFetch(`/invitations/${id}`);
  if (!res.ok) return null;
  return (await res.json()) as InvitationDetail;
}
