import type { AuditEventType } from './referral.enums';
import {
  AuditEvent,
  DisputeStatus,
  InvitationStatus,
  ReferralStatus,
} from './referral.enums';

/**
 * THE STATE MACHINE — one place to see the whole referral lifecycle.
 *
 * The tables below are the single source of truth for every legal transition.
 * Each event (an `AuditEventType`) moves an entity from one status to another;
 * `ReferralsService` implements exactly these transitions with guarded,
 * transactional updates (the guard = the lock). If a transition isn't here,
 * it can't happen.
 * 
 * Please see the .md file for a detailed explanation of this
 */

export interface Transition<S extends string> {
  readonly from: S;
  readonly on: AuditEventType;
  readonly to: S;
}

export const REFERRAL_TRANSITIONS: readonly Transition<ReferralStatus>[] = [
  { from: ReferralStatus.DRAFT, on: AuditEvent.REFERRAL_PLACED, to: ReferralStatus.MATCHING },
  { from: ReferralStatus.MATCHING, on: AuditEvent.FIRM_INVITED, to: ReferralStatus.MATCHING },
  { from: ReferralStatus.MATCHING, on: AuditEvent.INVITATION_ACCEPTED, to: ReferralStatus.MATCHED },
  { from: ReferralStatus.MATCHING, on: AuditEvent.REFERRAL_EXHAUSTED, to: ReferralStatus.UNMATCHED },
  { from: ReferralStatus.MATCHING, on: AuditEvent.LATE_ACCEPTANCE_HONORED, to: ReferralStatus.MATCHED },
  { from: ReferralStatus.UNMATCHED, on: AuditEvent.LATE_ACCEPTANCE_HONORED, to: ReferralStatus.MATCHED },
  { from: ReferralStatus.MATCHING, on: AuditEvent.DISPUTE_OPENED, to: ReferralStatus.IN_CONFLICT },
  { from: ReferralStatus.MATCHED, on: AuditEvent.DISPUTE_OPENED, to: ReferralStatus.IN_CONFLICT },
  { from: ReferralStatus.IN_CONFLICT, on: AuditEvent.DISPUTE_RESOLVED, to: ReferralStatus.MATCHED },
];

export const INVITATION_TRANSITIONS: readonly Transition<InvitationStatus>[] = [
  { from: InvitationStatus.ACTIVE, on: AuditEvent.INVITATION_ACCEPTED, to: InvitationStatus.ACCEPTED },
  { from: InvitationStatus.ACTIVE, on: AuditEvent.INVITATION_DECLINED, to: InvitationStatus.DECLINED },
  { from: InvitationStatus.ACTIVE, on: AuditEvent.INVITATION_EXPIRED, to: InvitationStatus.EXPIRED },
];

export const DISPUTE_TRANSITIONS: readonly Transition<DisputeStatus>[] = [
  { from: DisputeStatus.OPENED, on: AuditEvent.DISPUTE_RESOLVED, to: DisputeStatus.RESOLVED },
];

/** Statuses from which a referral never moves again. */
export const TERMINAL_REFERRAL_STATUSES: readonly ReferralStatus[] = [
  ReferralStatus.PAID,
  ReferralStatus.WITHDRAWN,
];

/** The status a referral lands in when `on` fires from `from` — or undefined. */
export function nextReferralStatus(
  from: ReferralStatus,
  on: AuditEventType,
): ReferralStatus | undefined {
  return REFERRAL_TRANSITIONS.find((t) => t.from === from && t.on === on)?.to;
}

/** Guard: is this referral transition declared by the machine? */
export function canReferralTransition(from: ReferralStatus, on: AuditEventType): boolean {
  return nextReferralStatus(from, on) !== undefined;
}
