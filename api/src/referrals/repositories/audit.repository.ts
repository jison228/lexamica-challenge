import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import {
  ReferralAuditEvent,
  ReferralAuditEventDocument,
} from '../schemas/referral-audit-event.schema';
import { AuditEvent } from '../referral.enums';
import type { AuditEventType } from '../referral.enums';
import type { Id } from '../id.type';

export interface AuditEventInput {
  referralId: Id;
  type: AuditEventType;
  occurredAt?: Date;
  firmId?: Id | null;
  invitationId?: Id | null;
  actorUserId?: Id | null;
  metadata?: Record<string, unknown>;
}

/**
 * Persistence for the append-only audit log. Owns the bitemporal defaulting:
 * `recordedAt` IS the write time; `occurredAt` defaults to it unless a real
 * (possibly earlier) time is supplied.
 */
@Injectable()
export class AuditRepository {
  constructor(
    @InjectModel(ReferralAuditEvent.name)
    private readonly model: Model<ReferralAuditEventDocument>,
  ) {}

  async record(e: AuditEventInput, session: ClientSession): Promise<void> {
    const now = new Date();
    await this.model.create(
      [
        {
          referralId: e.referralId,
          type: e.type,
          firmId: e.firmId ?? null,
          invitationId: e.invitationId ?? null,
          actorUserId: e.actorUserId ?? null,
          occurredAt: e.occurredAt ?? now,
          recordedAt: now,
          metadata: e.metadata ?? {},
        },
      ],
      { session },
    );
  }

  /** Has this firm already reported an off-platform signing on this referral? */
  async hasReported(referralId: Id, firmId: Id, session?: ClientSession): Promise<boolean> {
    const query = this.model.exists({
      referralId,
      type: AuditEvent.ACCEPTANCE_REPORTED,
      firmId,
    });
    const found = await (session ? query.session(session) : query);
    return found !== null;
  }

  /** Of these referrals, the ids this firm has already reported a signing on. */
  async referralIdsReportedBy(referralIds: string[], firmId: Id): Promise<string[]> {
    const ids = await this.model.distinct('referralId', {
      referralId: { $in: referralIds },
      type: AuditEvent.ACCEPTANCE_REPORTED,
      firmId,
    });
    return ids.map((id) => String(id));
  }
}
