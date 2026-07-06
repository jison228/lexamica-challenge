import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Invitation, InvitationDocument } from './invitation.schema';
import { InvitationStatus } from '../referrals/referral.enums';
import type { Id } from '../referrals/id.type';

/** Persistence for Invitations — the per-firm offers the referral routes through. */
@Injectable()
export class InvitationRepository {
  constructor(
    @InjectModel(Invitation.name) private readonly model: Model<InvitationDocument>,
  ) {}

  async create(data: Partial<Invitation>, session: ClientSession): Promise<InvitationDocument> {
    const [doc] = await this.model.create([data], { session });
    return doc;
  }

  /** ACTIVE + not-expired → ACCEPTED. The guard doubles as the accept lock. */
  acceptIfLive(
    id: Id,
    actorUserId: Id | null,
    now: Date,
    session: ClientSession,
  ): Promise<InvitationDocument | null> {
    return this.model.findOneAndUpdate(
      { _id: id, status: InvitationStatus.ACTIVE, expiresAt: { $gt: now } },
      { $set: { status: InvitationStatus.ACCEPTED, respondedAt: now, respondedByUserId: actorUserId } },
      { returnDocument: 'after', session },
    );
  }

  /** ACTIVE → DECLINED/EXPIRED (guarded on ACTIVE). */
  respondIfActive(
    id: Id,
    to: typeof InvitationStatus.DECLINED | typeof InvitationStatus.EXPIRED,
    actorUserId: Id | null,
    session: ClientSession,
  ): Promise<InvitationDocument | null> {
    const set: Record<string, unknown> = { status: to };
    if (to === InvitationStatus.DECLINED) {
      set.respondedAt = new Date();
      set.respondedByUserId = actorUserId;
    }
    return this.model.findOneAndUpdate(
      { _id: id, status: InvitationStatus.ACTIVE },
      { $set: set },
      { returnDocument: 'after', session },
    );
  }

  countByReferral(referralId: Id, session: ClientSession): Promise<number> {
    return this.model.countDocuments({ referralId }).session(session).exec();
  }

  findByIdInTxnLean(id: Id, session: ClientSession) {
    return this.model.findById(id).session(session).lean().exec();
  }

  findByIdLean(id: Id) {
    return this.model.findById(id).lean().exec();
  }

  /** The firm's inbox — every invitation ever sent to it, newest first. */
  findByFirmLean(firmId: Id) {
    return this.model.find({ firmId }).sort({ createdAt: -1 }).lean().exec();
  }
}
