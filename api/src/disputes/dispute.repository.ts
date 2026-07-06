import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Dispute, DisputeDocument } from './dispute.schema';
import { DisputeStatus } from '../referrals/referral.enums';
import type { DisputeReason } from '../referrals/referral.enums';
import type { Id } from '../referrals/id.type';

/** Persistence for Disputes — claims + resolution, embedded and read together. */
@Injectable()
export class DisputeRepository {
  constructor(
    @InjectModel(Dispute.name) private readonly model: Model<DisputeDocument>,
  ) {}

  async open(
    referralId: Id,
    reason: DisputeReason,
    claims: Record<string, unknown>[],
    session: ClientSession,
  ): Promise<DisputeDocument> {
    const [doc] = await this.model.create(
      [{ referralId, reason, status: DisputeStatus.OPENED, claims }],
      { session },
    );
    return doc;
  }

  /** OPENED → RESOLVED with the adjudicator's decision (guarded on unresolved). */
  resolve(
    id: Id,
    winnerFirmId: Id,
    actorUserId: Id | null,
    session: ClientSession,
  ): Promise<DisputeDocument | null> {
    return this.model.findOneAndUpdate(
      { _id: id, status: { $ne: DisputeStatus.RESOLVED } },
      {
        $set: {
          status: DisputeStatus.RESOLVED,
          resolution: { winnerFirmId, decidedByUserId: actorUserId, decidedAt: new Date() },
        },
      },
      { returnDocument: 'after', session },
    );
  }

  /** Append a party's statement to the open dispute (guarded on unresolved). */
  addClaimToOpen(
    referralId: Id,
    claim: Record<string, unknown>,
    session: ClientSession,
  ): Promise<DisputeDocument | null> {
    return this.model.findOneAndUpdate(
      { referralId, status: { $ne: DisputeStatus.RESOLVED } },
      { $push: { claims: claim } },
      { returnDocument: 'after', session },
    );
  }

  findOpenByReferralLean(referralId: Id) {
    return this.model
      .findOne({ referralId, status: { $ne: DisputeStatus.RESOLVED } })
      .lean()
      .exec();
  }
}
