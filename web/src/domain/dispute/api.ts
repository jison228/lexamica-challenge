import { apiClient } from '@/api/client';
import type { InvitationDetail } from '@/domain/invitation/types';
import type { ReportSigningInput } from './types';

/**
 * Client-side actions for the conflict/dispute flow. Each returns the updated
 * invitation detail (the caller writes it back into the invitation cache).
 */

export const reportSigning = (id: string, input: ReportSigningInput) =>
  apiClient.post<InvitationDetail>(`/invitations/${id}/report-acceptance`, input);

export const addDisputeStatement = (id: string, statement: string) =>
  apiClient.post<InvitationDetail>(`/invitations/${id}/dispute-statement`, {
    statement,
  });

export const resolveDispute = (id: string) =>
  apiClient.post<InvitationDetail>(`/invitations/${id}/resolve-dispute`);
