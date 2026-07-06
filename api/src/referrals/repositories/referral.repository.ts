import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Referral, ReferralDocument } from '../schemas/referral.schema';
import { ReferralStatus } from '../referral.enums';
import type { Id } from '../id.type';

/**
 * Persistence for the Referral aggregate root. Each write is a single guarded
 * (conditional) update — the filter IS the optimistic lock, so a stale action
 * matches no document and is rejected. The service composes these; it never
 * touches the model directly.
 */
@Injectable()
export class ReferralRepository {
  constructor(
    @InjectModel(Referral.name) private readonly model: Model<ReferralDocument>,
  ) {}

  // ── reads ────────────────────────────────────────────────────────────────

  findById(id: Id, session?: ClientSession): Promise<ReferralDocument | null> {
    const q = this.model.findById(id);
    return (session ? q.session(session) : q).exec();
  }

  findByIdLean(id: Id) {
    return this.model.findById(id).lean().exec();
  }

  findByIdsLean(ids: string[]) {
    return this.model.find({ _id: { $in: ids } }).lean().exec();
  }

  // ── guarded transitions ────────────────────────────────────────────────────

  /** DRAFT → MATCHING (guarded on DRAFT). */
  placeFromDraft(id: Id, session: ClientSession): Promise<ReferralDocument | null> {
    return this.model.findOneAndUpdate(
      { _id: id, status: ReferralStatus.DRAFT },
      { $set: { status: ReferralStatus.MATCHING, placedAt: new Date() } },
      { returnDocument: 'after', session },
    );
  }

  /** MATCHING → MATCHED, but only while still routing this exact invitation. */
  matchRoutedInvitation(
    id: Id,
    invitationId: Id,
    firmId: Id,
    session: ClientSession,
  ): Promise<ReferralDocument | null> {
    return this.model.findOneAndUpdate(
      { _id: id, status: ReferralStatus.MATCHING, currentInvitationId: invitationId },
      {
        $set: {
          status: ReferralStatus.MATCHED,
          currentAcceptedFirmId: firmId,
          currentInvitationId: null,
        },
      },
      { returnDocument: 'after', session },
    );
  }

  /** Honor a late report, but only while the case is still unclaimed. */
  honorLateAcceptance(
    id: Id,
    firmId: Id,
    session: ClientSession,
  ): Promise<ReferralDocument | null> {
    return this.model.findOneAndUpdate(
      { _id: id, currentAcceptedFirmId: null },
      {
        $set: {
          status: ReferralStatus.MATCHED,
          currentAcceptedFirmId: firmId,
          currentInvitationId: null,
        },
      },
      { returnDocument: 'after', session },
    );
  }

  // ── unconditional updates (caller already holds the invariant) ──────────────

  /** Award the case to a firm after a dispute is resolved. */
  async award(id: Id, firmId: Id, session: ClientSession): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      {
        $set: {
          status: ReferralStatus.MATCHED,
          currentAcceptedFirmId: firmId,
          currentInvitationId: null,
        },
      },
      { session },
    );
  }

  async markInConflict(id: Id, session: ClientSession): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      { $set: { status: ReferralStatus.IN_CONFLICT } },
      { session },
    );
  }

  async markExhausted(id: Id, session: ClientSession): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      { $set: { status: ReferralStatus.UNMATCHED, currentInvitationId: null } },
      { session },
    );
  }

  async setCurrentInvitation(id: Id, invitationId: Id, session: ClientSession): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      { $set: { currentInvitationId: invitationId, status: ReferralStatus.MATCHING } },
      { session },
    );
  }
}
