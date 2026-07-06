/**
 * Mirrors the API's invited-firm projections (no codegen). Statuses are
 * const-object enums (reference `ReferralStatus.MATCHED` — never the raw string)
 * with a derived union type of the same name. The disclosure boundary is
 * encoded in the types: `protectedDetails` is nullable and only arrives
 * populated when this firm is the accepted firm.
 */

export const ReferralStatus = {
  DRAFT: 'DRAFT',
  MATCHING: 'MATCHING',
  MATCHED: 'MATCHED',
  UNMATCHED: 'UNMATCHED',
  IN_CONFLICT: 'IN_CONFLICT',
  RESOLVED: 'RESOLVED',
  PAID: 'PAID',
  WITHDRAWN: 'WITHDRAWN',
} as const;
export type ReferralStatus = (typeof ReferralStatus)[keyof typeof ReferralStatus];

export const InvitationStatus = {
  ACTIVE: 'ACTIVE',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const;
export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus];

export interface PublicSummary {
  caseType: string;
  state: string;
  estimatedValueRange?: string;
  description?: string;
}

export interface ProtectedDetails {
  clientName: string;
  clientContact?: string;
  narrative?: string;
}

export interface InvitationSummary {
  invitationId: string;
  referralId: string;
  status: InvitationStatus;
  position: number;
  sentAt: string;
  expiresAt: string;
  respondedAt: string | null;
  /** Status of the parent referral this invitation belongs to. */
  referralStatus: ReferralStatus;
  publicSummary: PublicSummary;
  /** True when this firm currently holds the case. */
  amAccepted: boolean;
  /** True once this firm has reported a signing here (can't report again). */
  alreadyReported: boolean;
}

export interface DisputeStatement {
  content: string;
  occurredAt: string;
}

export interface InvitationDetail extends InvitationSummary {
  /** Populated ONLY when `amAccepted` — the disclosure gate. */
  protectedDetails: ProtectedDetails | null;
  disputeStatus: string | null;
  disputeReason: string | null;
  /** This firm's OWN statements to the adjudicator — never the other side's. */
  disputeStatements: DisputeStatement[];
}
