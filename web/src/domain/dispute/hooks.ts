'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationKeys } from '@/domain/invitation/keys';
import { useInvalidateInvitations } from '@/domain/invitation/hooks';
import * as api from './api';
import type { ReportSigningInput } from './types';

/** Report an off-platform signing (server decides claim vs dispute vs honor). */
export function useReportSigning(id: string) {
  const qc = useQueryClient();
  const invalidate = useInvalidateInvitations();
  return useMutation({
    mutationFn: (input: ReportSigningInput) => api.reportSigning(id, input),
    onSuccess: (data) => qc.setQueryData(invitationKeys.detail(id), data),
    onSettled: invalidate,
  });
}

/** Demo shortcut — resolve the open dispute, awarding to the current firm. */
export function useResolveDispute(id: string) {
  const qc = useQueryClient();
  const invalidate = useInvalidateInvitations();
  return useMutation({
    mutationFn: () => api.resolveDispute(id),
    onSuccess: (data) => qc.setQueryData(invitationKeys.detail(id), data),
    onSettled: invalidate,
  });
}

/** Submit a statement to the adjudicator on an open dispute. */
export function useAddDisputeStatement(id: string) {
  const qc = useQueryClient();
  const invalidate = useInvalidateInvitations();
  return useMutation({
    mutationFn: (statement: string) => api.addDisputeStatement(id, statement),
    onSuccess: (data) => qc.setQueryData(invitationKeys.detail(id), data),
    onSettled: invalidate,
  });
}
