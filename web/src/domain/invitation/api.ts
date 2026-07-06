import { apiClient } from '@/api/client';
import type { InvitationDetail, InvitationSummary } from './types';

/** Client-side fetchers + actions for the invited-firm surface. */

export const getInbox = () => apiClient.get<InvitationSummary[]>('/invitations');

export const getInvitation = (id: string) =>
  apiClient.get<InvitationDetail>(`/invitations/${id}`);

export const acceptInvitation = (id: string) =>
  apiClient.post<InvitationDetail>(`/invitations/${id}/accept`);

export const declineInvitation = (id: string) =>
  apiClient.post<InvitationDetail>(`/invitations/${id}/decline`);

/** Time simulation (dev/demo) — force-expire a live invitation. */
export const forceExpire = (id: string) =>
  apiClient.post<{ referralId: string; status: string }>(
    `/invitations/${id}/force-expire`,
  );
