'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitationKeys } from './keys';
import * as api from './api';
import type { InvitationDetail, InvitationSummary } from './types';

// The data changes underneath the user (invites expire, firms accept, disputes
// open), so we poll and refetch-on-focus to keep every screen honest.
const POLL_MS = 4000;

export function useInbox(initialData?: InvitationSummary[]) {
  return useQuery({
    queryKey: invitationKeys.inbox,
    queryFn: api.getInbox,
    initialData,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  });
}

export function useInvitation(id: string, initialData?: InvitationDetail) {
  return useQuery({
    queryKey: invitationKeys.detail(id),
    queryFn: () => api.getInvitation(id),
    initialData,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  });
}

/** Invalidate everything a transition can touch (inbox + any open detail).
 * Exported so the dispute hooks can reuse it. */
export function useInvalidateInvitations() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: invitationKeys.inbox });
    void qc.invalidateQueries({ queryKey: ['invitation'] });
  };
}

/**
 * Accept — deliberately NOT optimistic. We never show a premature "accepted"
 * (that would risk a lie); the button shows a pending spinner and the case only
 * flips to matched + unlocked on the server's confirmation. On a 409 the action
 * rolls back to actionable and the caller surfaces `error.code` (expired vs
 * already taken).
 */
export function useAccept(id: string) {
  const qc = useQueryClient();
  const invalidate = useInvalidateInvitations();
  return useMutation({
    mutationFn: () => api.acceptInvitation(id),
    onSuccess: (data) => qc.setQueryData(invitationKeys.detail(id), data),
    onSettled: invalidate,
  });
}

export function useDecline(id: string) {
  const qc = useQueryClient();
  const invalidate = useInvalidateInvitations();
  return useMutation({
    mutationFn: () => api.declineInvitation(id),
    onSuccess: (data) => qc.setQueryData(invitationKeys.detail(id), data),
    onSettled: invalidate,
  });
}

export function useForceExpire() {
  const invalidate = useInvalidateInvitations();
  return useMutation({
    mutationFn: (id: string) => api.forceExpire(id),
    onSettled: invalidate,
  });
}
