import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { REFERRAL_STATUSES, ReferralStatus } from '../referral.enums';

/**
 * DISCLOSURE BOUNDARY — the whole confidentiality requirement lives in these
 * two sub-shapes. `publicSummary` is what candidate firms see BEFORE accepting
 * (non-identifying). `protectedDetails` is what ONLY the accepted firm sees
 * AFTER accepting (identifying). The API never serializes `protectedDetails`
 * unless the requesting firm is the accepted firm.
 */
@Schema({ _id: false })
export class PublicSummary {
  @Prop({ required: true }) caseType: string;
  @Prop({ required: true }) state: string;
  @Prop() estimatedValueRange?: string;
  /** Non-identifying public description of the matter (no client identity). */
  @Prop() description?: string;
}
export const PublicSummarySchema = SchemaFactory.createForClass(PublicSummary);

@Schema({ _id: false })
export class ProtectedDetails {
  @Prop({ required: true }) clientName: string;
  @Prop() clientContact?: string;
  @Prop() narrative?: string;
}
export const ProtectedDetailsSchema =
  SchemaFactory.createForClass(ProtectedDetails);

@Schema({ timestamps: true })
export class Referral {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Firm', required: true })
  originatedFirmId: Types.ObjectId;

  /** Ordered candidate queue, fixed at placement. Invitations are created
   * lazily as the sequence advances (see Invitation.position). */
  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Firm' }], default: [] })
  candidateFirmIds: Types.ObjectId[];

  /** The single live invitation, if any. Enforces "one at a time". */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Invitation', default: null })
  currentInvitationId: Types.ObjectId | null;

  /** The firm that currently holds the case — the platform's *current belief*. */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Firm', default: null })
  currentAcceptedFirmId: Types.ObjectId | null;

  @Prop({ type: String, enum: REFERRAL_STATUSES, default: ReferralStatus.DRAFT, index: true })
  status: ReferralStatus;

  @Prop({ type: PublicSummarySchema, required: true })
  publicSummary: PublicSummary;

  @Prop({ type: ProtectedDetailsSchema, required: true })
  protectedDetails: ProtectedDetails;

  @Prop({ type: Date, default: null })
  placedAt: Date | null;
}

export type ReferralDocument = HydratedDocument<Referral>;
export const ReferralSchema = SchemaFactory.createForClass(Referral);
