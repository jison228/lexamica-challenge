import type { InvitationStatus, ReferralStatus } from './referral.enums';

/**
 * API response shapes for the invited-firm experience. These are the ONLY
 * shapes that leave the server, and they encode the disclosure boundary:
 * `protectedDetails` is typed as nullable and is populated ONLY for the
 * accepted firm (see ReferralsReadService).
 */

export interface PublicSummaryView {
  caseType: string;
  state: string;
  estimatedValueRange?: string;
  description?: string;
}

export interface ProtectedDetailsView {
  clientName: string;
  clientContact?: string;
  narrative?: string;
}

export interface InvitationListItem {
  invitationId: string;
  referralId: string;
  status: InvitationStatus;
  position: number;
  sentAt: Date;
  expiresAt: Date;
  respondedAt: Date | null;
  referralStatus: ReferralStatus;
  publicSummary: PublicSummaryView;
  /** True when this firm is the one currently holding the case. */
  amAccepted: boolean;
  /** True once this firm has reported a signing here (can't report again). */
  alreadyReported: boolean;
}

export interface DisputeStatementView {
  content: string;
  occurredAt: Date;
}

export interface InvitationDetail extends InvitationListItem {
  /** Populated ONLY when `amAccepted` — the disclosure gate. Null otherwise. */
  protectedDetails: ProtectedDetailsView | null;
  disputeStatus: string | null;
  disputeReason: string | null;
  /** This firm's OWN statements to the adjudicator — never the other side's. */
  disputeStatements: DisputeStatementView[];
}
