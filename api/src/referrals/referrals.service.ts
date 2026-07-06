import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';
import { ReferralDocument } from './schemas/referral.schema';
import { DisputeDocument } from '../disputes/dispute.schema';
import { AuditEvent, DisputeReason, InvitationStatus } from './referral.enums';
import { canReferralTransition } from './referral.state-machine';
import type { Id } from './id.type';
import { ReferralRepository } from './repositories/referral.repository';
import { InvitationRepository } from '../invitations/invitation.repository';
import { DisputeRepository } from '../disputes/dispute.repository';
import { AuditRepository } from './repositories/audit.repository';

/**
 * The Referral aggregate's behaviour — the state machine.
 *
 * Every mutation is a single guarded, transactional transition:
 *  - the guard lives in the repository's query FILTER (a conditional update),
 *    so it doubles as the lock — a stale action matches no document and fails;
 *  - every transition appends an immutable audit event (the timeline);
 *  - all writes happen inside one Mongo transaction, so state + audit are atomic.
 *
 * Data access lives in the repositories; this service is pure orchestration:
 * it decides which transitions to attempt, records the audit trail, and turns
 * a no-op guard into a precise 409 the frontend can explain.
 *
 * The complete transition table — every status × event → status — lives in
 * `referral.state-machine.ts`, the single typed source of truth for the
 * lifecycle. This service implements exactly those transitions.
 */
@Injectable()
export class ReferralsService {
  constructor(
    private readonly referrals: ReferralRepository,
    private readonly invitations: InvitationRepository,
    private readonly disputes: DisputeRepository,
    private readonly audit: AuditRepository,
    @InjectConnection() private readonly connection: Connection,
    private readonly config: ConfigService,
  ) {}

  // ─── Transitions ──────────────────────────────────────────────────────────

  /** DRAFT → MATCHING, and invite the first candidate. */
  async place(referralId: Id): Promise<ReferralDocument | null> {
    return this.withTxn(async (session) => {
      const ref = await this.referrals.placeFromDraft(referralId, session);
      if (!ref) throw this.conflict('NOT_DRAFT', 'Referral is not in DRAFT.');
      await this.audit.record(
        { referralId: ref._id, type: AuditEvent.REFERRAL_PLACED, firmId: ref.originatedFirmId },
        session,
      );
      await this.inviteNext(session, ref);
      return this.referrals.findById(ref._id, session);
    });
  }

  /** In-window accept: MATCHING → MATCHED. Guarded on ACTIVE + not-expired. */
  async accept(invitationId: Id, actorUserId: Id | null): Promise<ReferralDocument> {
    return this.withTxn(async (session) => {
      const now = new Date();
      const inv = await this.invitations.acceptIfLive(invitationId, actorUserId, now, session);
      if (!inv) throw await this.buildAcceptConflict(invitationId, session);

      // Referral must still be routing this exact invitation.
      const ref = await this.referrals.matchRoutedInvitation(
        inv.referralId,
        inv._id,
        inv.firmId,
        session,
      );
      if (!ref) {
        throw this.conflict(
          'ALREADY_MATCHED',
          'This case is no longer available — another firm already holds it.',
        );
      }
      await this.audit.record(
        {
          referralId: ref._id,
          type: AuditEvent.INVITATION_ACCEPTED,
          firmId: inv.firmId,
          invitationId: inv._id,
          actorUserId,
        },
        session,
      );
      return ref;
    });
  }

  /** Firm declines → advance to the next candidate (or exhaust). */
  async decline(invitationId: Id, actorUserId: Id | null): Promise<ReferralDocument | null> {
    return this.respondAndAdvance(
      invitationId,
      InvitationStatus.DECLINED,
      AuditEvent.INVITATION_DECLINED,
      actorUserId,
    );
  }

  /** Simulated time: force-expire the live invitation → advance (system event). */
  async expire(invitationId: Id): Promise<ReferralDocument | null> {
    return this.respondAndAdvance(
      invitationId,
      InvitationStatus.EXPIRED,
      AuditEvent.INVITATION_EXPIRED,
      null,
    );
  }

  /**
   * Out-of-band off-platform signing. Records the neutral fact, then reconciles:
   *  - case already held by another firm  → DOUBLE_SIGN dispute
   *  - unclaimed but a rival has a live invite → LATE_ACCEPTED dispute
   *  - unclaimed and safe → honor it (LATE_ACCEPTANCE_HONORED)
   */
  async reportAcceptance(
    referralId: Id,
    firmId: Id,
    actorUserId: Id | null,
    signedAt: Date,
  ): Promise<ReferralDocument | null> {
    return this.withTxn(async (session) => {
      const ref = await this.referrals.findById(referralId, session);
      if (!ref) throw new NotFoundException('Referral not found.');

      // One report per firm per referral — no re-opening a dispute after the
      // case has already been adjudicated.
      if (await this.audit.hasReported(ref._id, firmId, session)) {
        throw this.conflict(
          'ALREADY_REPORTED',
          'You have already reported a signing on this referral.',
        );
      }

      await this.audit.record(
        {
          referralId: ref._id,
          type: AuditEvent.ACCEPTANCE_REPORTED,
          firmId,
          actorUserId,
          occurredAt: signedAt,
          metadata: { signedAt },
        },
        session,
      );

      // Held by another firm → the ethics emergency: halt and open a dispute.
      if (ref.currentAcceptedFirmId) {
        if (String(ref.currentAcceptedFirmId) === String(firmId)) return ref; // they hold it
        return this.openDispute(session, ref, DisputeReason.DOUBLE_SIGN, firmId, signedAt);
      }

      // Unclaimed → honor directly. The claiming firm has the real-world signing,
      // so any still-live invite to a rival candidate is superseded (expired).
      if (ref.currentInvitationId) {
        const superseded = await this.invitations.respondIfActive(
          ref.currentInvitationId,
          InvitationStatus.EXPIRED,
          null,
          session,
        );
        if (superseded) {
          await this.audit.record(
            {
              referralId: ref._id,
              type: AuditEvent.INVITATION_EXPIRED,
              firmId: superseded.firmId,
              invitationId: superseded._id,
            },
            session,
          );
        }
      }

      const updated = await this.referrals.honorLateAcceptance(ref._id, firmId, session);
      await this.audit.record(
        {
          referralId: ref._id,
          type: AuditEvent.LATE_ACCEPTANCE_HONORED,
          firmId,
          actorUserId,
          occurredAt: signedAt,
        },
        session,
      );
      return updated;
    });
  }

  /** Human adjudication: IN_CONFLICT → MATCHED (winner). */
  async resolveDispute(
    disputeId: Id,
    winnerFirmId: Id,
    actorUserId: Id | null,
  ): Promise<ReferralDocument | null> {
    return this.withTxn(async (session) => {
      const dispute = await this.disputes.resolve(disputeId, winnerFirmId, actorUserId, session);
      if (!dispute) throw this.conflict('ALREADY_RESOLVED', 'Dispute already resolved.');

      await this.referrals.award(dispute.referralId, winnerFirmId, session);
      await this.audit.record(
        {
          referralId: dispute.referralId,
          type: AuditEvent.DISPUTE_RESOLVED,
          firmId: winnerFirmId,
          actorUserId,
          metadata: { winnerFirmId, disputeId: dispute._id },
        },
        session,
      );
      return this.referrals.findById(dispute.referralId, session);
    });
  }

  /**
   * A party submits a statement to the adjudicator (private to Lexamica).
   * Appends a Claim to the open dispute and records it as a DISPUTE_CLAIM event.
   * Guarded on an unresolved dispute — nothing to add once it's decided.
   */
  async addDisputeStatement(
    referralId: Id,
    firmId: Id,
    statement: string,
    actorUserId: Id | null,
  ): Promise<DisputeDocument> {
    return this.withTxn(async (session) => {
      const dispute = await this.disputes.addClaimToOpen(
        referralId,
        { firmId, invitationId: null, occurredAt: new Date(), content: statement },
        session,
      );
      if (!dispute) {
        throw this.conflict('NO_OPEN_DISPUTE', 'There is no open dispute on this referral.');
      }
      await this.audit.record(
        { referralId, type: AuditEvent.DISPUTE_CLAIM, firmId, actorUserId, metadata: { disputeId: dispute._id } },
        session,
      );
      return dispute;
    });
  }

  // ─── Internals ────────────────────────────────────────────────────────────

  private async respondAndAdvance(
    invitationId: Id,
    to: typeof InvitationStatus.DECLINED | typeof InvitationStatus.EXPIRED,
    event: typeof AuditEvent.INVITATION_DECLINED | typeof AuditEvent.INVITATION_EXPIRED,
    actorUserId: Id | null,
  ): Promise<ReferralDocument | null> {
    return this.withTxn(async (session) => {
      const inv = await this.invitations.respondIfActive(invitationId, to, actorUserId, session);
      if (!inv) throw this.conflict('INVITATION_CLOSED', 'This invitation is no longer active.');

      await this.audit.record(
        { referralId: inv.referralId, type: event, firmId: inv.firmId, invitationId: inv._id, actorUserId },
        session,
      );
      const ref = await this.referrals.findById(inv.referralId, session);
      if (ref) await this.inviteNext(session, ref);
      return this.referrals.findById(inv.referralId, session);
    });
  }

  /** Create the next candidate's invitation, or exhaust the referral. */
  private async inviteNext(session: ClientSession, referral: ReferralDocument): Promise<void> {
    const sent = await this.invitations.countByReferral(referral._id, session);

    if (sent >= referral.candidateFirmIds.length) {
      await this.referrals.markExhausted(referral._id, session);
      await this.audit.record({ referralId: referral._id, type: AuditEvent.REFERRAL_EXHAUSTED }, session);
      return;
    }

    const position = sent;
    const firmId = referral.candidateFirmIds[position];
    const now = new Date();
    const ttl = this.config.getOrThrow<number>('referral.invitationTtlMs');
    const invite = await this.invitations.create(
      {
        referralId: referral._id,
        firmId,
        position,
        status: InvitationStatus.ACTIVE,
        sentAt: now,
        expiresAt: new Date(now.getTime() + ttl),
      },
      session,
    );
    await this.referrals.setCurrentInvitation(referral._id, invite._id, session);
    await this.audit.record(
      {
        referralId: referral._id,
        type: AuditEvent.FIRM_INVITED,
        firmId,
        invitationId: invite._id,
        metadata: { position, expiresAt: invite.expiresAt },
      },
      session,
    );
  }

  private async openDispute(
    session: ClientSession,
    referral: ReferralDocument,
    reason: DisputeReason,
    reporterFirmId: Id,
    signedAt: Date,
  ): Promise<ReferralDocument | null> {
    // Machine invariant: you can only open a dispute from a live/matched state —
    // never on a referral that's already under review (no duplicate disputes).
    if (!canReferralTransition(referral.status, AuditEvent.DISPUTE_OPENED)) {
      throw this.conflict('ALREADY_UNDER_REVIEW', 'This referral is already under review.');
    }

    const now = new Date();
    const claims: Record<string, unknown>[] = [];
    if (referral.currentAcceptedFirmId) {
      claims.push({
        firmId: referral.currentAcceptedFirmId,
        invitationId: null,
        occurredAt: now,
        content: 'Holds the case per platform state.',
      });
    }
    claims.push({
      firmId: reporterFirmId,
      invitationId: null,
      occurredAt: signedAt,
      content: 'Reported an off-platform signing.',
    });

    const dispute = await this.disputes.open(referral._id, reason, claims, session);
    await this.referrals.markInConflict(referral._id, session);
    await this.audit.record(
      {
        referralId: referral._id,
        type: AuditEvent.DISPUTE_OPENED,
        firmId: reporterFirmId,
        occurredAt: signedAt,
        metadata: { reason, disputeId: dispute._id },
      },
      session,
    );
    return this.referrals.findById(referral._id, session);
  }

  /** Diagnose why an accept guard matched no document → precise 409 code. */
  private async buildAcceptConflict(
    invitationId: Id,
    session: ClientSession,
  ): Promise<HttpException> {
    const current = await this.invitations.findByIdInTxnLean(invitationId, session);
    if (!current) return new NotFoundException('Invitation not found.');
    if (current.status === InvitationStatus.ACCEPTED)
      return this.conflict('ALREADY_ACCEPTED', 'You have already accepted this invitation.');
    if (current.status !== InvitationStatus.ACTIVE)
      return this.conflict('INVITATION_CLOSED', 'This invitation is no longer active.');
    return this.conflict(
      'INVITATION_EXPIRED',
      'This invitation expired before your acceptance reached us.',
    );
  }

  private conflict(code: string, message: string): ConflictException {
    return new ConflictException({ code, message });
  }

  private async withTxn<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();
    try {
      let result: T | undefined;
      await session.withTransaction(async (s) => {
        result = await fn(s);
      });
      return result as T;
    } finally {
      await session.endSession();
    }
  }
}
