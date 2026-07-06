import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { DISPUTE_REASONS, DISPUTE_STATUSES, DisputeStatus } from '../referrals/referral.enums';
import type { DisputeReason } from '../referrals/referral.enums';

/** A competing assertion within a dispute. Kept thin — the raw fact also lives
 * as a ReferralAuditEvent; this is the adjudication-facing view. */
@Schema({ _id: true })
export class Claim {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Firm', required: true })
  firmId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Invitation', default: null })
  invitationId: Types.ObjectId | null;

  @Prop() content?: string;

  @Prop({ type: Date, required: true })
  occurredAt: Date;
}
const ClaimSchema = SchemaFactory.createForClass(Claim);

@Schema({ _id: false })
export class Resolution {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Firm', default: null })
  winnerFirmId: Types.ObjectId | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  decidedByUserId: Types.ObjectId | null;

  @Prop({ type: Date }) decidedAt?: Date;
  @Prop() content?: string;
}
const ResolutionSchema = SchemaFactory.createForClass(Resolution);

/** Owned by a Referral. Claims + resolution embedded (0..n, 0..1) — simpler
 * than separate collections and always read together. */
@Schema({ timestamps: true })
export class Dispute {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Referral', required: true, index: true })
  referralId: Types.ObjectId;

  @Prop({ type: String, enum: DISPUTE_STATUSES, default: DisputeStatus.OPENED })
  status: DisputeStatus;

  @Prop({ type: String, enum: DISPUTE_REASONS, required: true })
  reason: DisputeReason;

  @Prop({ type: [ClaimSchema], default: [] })
  claims: Claim[];

  @Prop({ type: ResolutionSchema, default: null })
  resolution: Resolution | null;
}

export type DisputeDocument = HydratedDocument<Dispute>;
export const DisputeSchema = SchemaFactory.createForClass(Dispute);
