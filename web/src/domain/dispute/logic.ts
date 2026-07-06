import { InvitationStatus, ReferralStatus } from '@/domain/invitation/types';
import type { InvitationSummary } from '@/domain/invitation/types';
import { ReportKind } from './types';

/**
 * Derivations for the report / conflict flow. These read an invitation object
 * but describe its dispute-facing behaviour, so they live with the dispute domain.
 */

/** My invitation closed without me taking it, but I can still report an
 * off-platform signing (claim it, or contest whoever holds it). Not while a
 * dispute is already open — nothing more to claim until it resolves. */
export const canReportSigning = (i: InvitationSummary): boolean =>
  (i.status === InvitationStatus.EXPIRED || i.status === InvitationStatus.DECLINED) &&
  !i.amAccepted &&
  // Only once per referral — not after this firm has already reported (and the
  // dispute has been adjudicated).
  !i.alreadyReported &&
  i.referralStatus !== ReferralStatus.IN_CONFLICT &&
  i.referralStatus !== ReferralStatus.WITHDRAWN &&
  i.referralStatus !== ReferralStatus.PAID;

/** What reporting a signing will do RIGHT NOW (the server decides finally). */
export const reportKind = (i: InvitationSummary): ReportKind =>
  i.referralStatus === ReferralStatus.MATCHED ? ReportKind.DISPUTE : ReportKind.CLAIM;

/** This referral is in an open conflict (mine to hold, or mine that I reported). */
export const isUnderReview = (i: InvitationSummary): boolean =>
  i.referralStatus === ReferralStatus.IN_CONFLICT;
