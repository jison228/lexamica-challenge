import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { INVITATION_STATUSES, InvitationStatus } from '../referrals/referral.enums';

/** One concrete offer of a referral to one candidate firm. Created lazily as
 * the sequence advances; only exists once an offer was actually made. */
@Schema({ timestamps: true })
export class Invitation {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Referral', required: true })
  referralId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Firm', required: true })
  firmId: Types.ObjectId;

  /** Index into Referral.candidateFirmIds — the queue order. */
  @Prop({ type: Number, required: true })
  position: number;

  @Prop({
    type: String,
    enum: INVITATION_STATUSES,
    default: InvitationStatus.ACTIVE,
    index: true,
  })
  status: InvitationStatus;

  @Prop({ type: Date, required: true })
  sentAt: Date;

  /** Server-authoritative deadline — the accept guard re-checks against this. */
  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date, default: null })
  respondedAt: Date | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  respondedByUserId: Types.ObjectId | null;
}

export type InvitationDocument = HydratedDocument<Invitation>;
export const InvitationSchema = SchemaFactory.createForClass(Invitation);

/**
 * Hard invariant at the DB level: AT MOST ONE ACTIVE invitation per referral.
 * A partial unique index makes a second concurrent ACTIVE insert impossible,
 * even if the transactional guard were ever bypassed.
 */
InvitationSchema.index(
  { referralId: 1 },
  { unique: true, partialFilterExpression: { status: InvitationStatus.ACTIVE } },
);
// Query/sort by candidate order within a referral.
InvitationSchema.index({ referralId: 1, position: 1 });
