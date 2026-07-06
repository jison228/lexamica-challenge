import type { InvitationSummary } from './types';
import { InvitationStatus, ReferralStatus } from './types';

/**
 * Pure invitation derivations — "what does this invitation mean / what can the
 * firm do with it". Shared by the list, the detail, badges, and the dashboard,
 * so the rules live in exactly one place. (Conflict/report derivations live in
 * the dispute domain.)
 */

/** I hold this case → it belongs in "Cases", not "Invitations". */
export const isHeldCase = (i: InvitationSummary): boolean => i.amAccepted;

/** I'm still deciding / never took it → it belongs in "Invitations". */
export const isPendingInvitation = (i: InvitationSummary): boolean =>
  !i.amAccepted;

/** A live offer I can accept or decline — my invite is open AND the referral
 * isn't paused by an open dispute (a conflict halts all accept/decline). */
export const isInvitationLive = (i: InvitationSummary): boolean =>
  i.status === InvitationStatus.ACTIVE &&
  i.referralStatus !== ReferralStatus.IN_CONFLICT;

/** The single semantic state we render from — presentation maps it to a label. */
export type InvitationUiState =
  | 'awaiting' // live, mine to decide
  | 'held' // I hold this case
  | 'taken' // another firm holds it
  | 'under_review' // in an open dispute
  | 'expired' // closed, can still report
  | 'declined'
  | 'closed';

export function invitationUiState(i: InvitationSummary): InvitationUiState {
  if (i.referralStatus === ReferralStatus.IN_CONFLICT) return 'under_review';
  if (i.amAccepted) return 'held';
  if (i.status === InvitationStatus.ACTIVE) return 'awaiting';
  if (i.referralStatus === ReferralStatus.MATCHED) return 'taken';
  if (i.alreadyReported) return 'closed';
  if (i.status === InvitationStatus.DECLINED) return 'declined';
  if (i.status === InvitationStatus.EXPIRED) return 'expired';
  return 'closed';
}
