/**
 * Single source of truth for the referral domain's enums.
 *
 * Each is a `const` object of NAMED CONSTANTS (reference `ReferralStatus.MATCHING`
 * — never the raw string), a derived union type of the same name, and a values
 * array for the Mongoose `enum` validator. One declaration gives all three, so
 * there are no hardcoded status/event strings anywhere else in the codebase.
 */

export const ReferralStatus = {
  DRAFT: 'DRAFT', // created, candidate list selected, not yet placed
  MATCHING: 'MATCHING', // inviting candidates one at a time
  MATCHED: 'MATCHED', // a firm holds the case
  UNMATCHED: 'UNMATCHED', // list exhausted, nobody accepted (revivable by a late report)
  IN_CONFLICT: 'IN_CONFLICT', // a dispute halted the referral
  RESOLVED: 'RESOLVED', // case settled (design-only)
  PAID: 'PAID', // fee disbursed (design-only)
  WITHDRAWN: 'WITHDRAWN', // pulled from the platform (terminal, non-revivable)
} as const;
export type ReferralStatus = (typeof ReferralStatus)[keyof typeof ReferralStatus];
export const REFERRAL_STATUSES = Object.values(ReferralStatus);

export const InvitationStatus = {
  ACTIVE: 'ACTIVE',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const;
export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus];
export const INVITATION_STATUSES = Object.values(InvitationStatus);

export const DisputeStatus = {
  OPENED: 'OPENED',
  IN_CONTEST: 'IN_CONTEST',
  RESOLVED: 'RESOLVED',
} as const;
export type DisputeStatus = (typeof DisputeStatus)[keyof typeof DisputeStatus];
export const DISPUTE_STATUSES = Object.values(DisputeStatus);

export const DisputeReason = {
  DOUBLE_SIGN: 'DOUBLE_SIGN', // two firms claim the same client (firm vs firm)
  LATE_ACCEPTED: 'LATE_ACCEPTED', // a late report can't be auto-honored (firm vs platform)
} as const;
export type DisputeReason = (typeof DisputeReason)[keyof typeof DisputeReason];
export const DISPUTE_REASONS = Object.values(DisputeReason);

export const AuditEvent = {
  // referral milestones
  REFERRAL_PLACED: 'REFERRAL_PLACED',
  REFERRAL_EXHAUSTED: 'REFERRAL_EXHAUSTED',
  REFERRAL_WITHDRAWN: 'REFERRAL_WITHDRAWN',
  REFERRAL_RESOLVED: 'REFERRAL_RESOLVED',
  REFERRAL_PAID: 'REFERRAL_PAID',
  // invitation lifecycle
  FIRM_INVITED: 'FIRM_INVITED',
  INVITATION_ACCEPTED: 'INVITATION_ACCEPTED',
  INVITATION_DECLINED: 'INVITATION_DECLINED',
  INVITATION_EXPIRED: 'INVITATION_EXPIRED',
  // out-of-band signing & conflict
  ACCEPTANCE_REPORTED: 'ACCEPTANCE_REPORTED',
  LATE_ACCEPTANCE_HONORED: 'LATE_ACCEPTANCE_HONORED',
  DISPUTE_OPENED: 'DISPUTE_OPENED',
  DISPUTE_CLAIM: 'DISPUTE_CLAIM',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
} as const;
export type AuditEventType = (typeof AuditEvent)[keyof typeof AuditEvent];
export const AUDIT_EVENT_TYPES = Object.values(AuditEvent);
