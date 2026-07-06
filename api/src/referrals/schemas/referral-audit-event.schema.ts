import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { AUDIT_EVENT_TYPES } from '../referral.enums';
import type { AuditEventType } from '../referral.enums';

/**
 * The append-only, immutable timeline of a referral — the legal evidence for
 * disputes. Bitemporal: `occurredAt` = when it actually occurred (valid time),
 * `recordedAt` = platform time (transaction time). A late report is exactly
 * `occurredAt << recordedAt`. No timestamps option: `recordedAt` IS the
 * creation time, and rows are never updated.
 */
@Schema({ timestamps: false })
export class ReferralAuditEvent {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Referral', required: true, index: true })
  referralId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Invitation', default: null })
  invitationId: Types.ObjectId | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Firm', default: null })
  firmId: Types.ObjectId | null;

  /** The human who caused it; `null` for system/time-triggered events. */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  actorUserId: Types.ObjectId | null;

  @Prop({ type: String, enum: AUDIT_EVENT_TYPES, required: true })
  type: AuditEventType;

  @Prop({ type: Date, required: true })
  occurredAt: Date;

  @Prop({ type: Date, required: true })
  recordedAt: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;
}

export type ReferralAuditEventDocument = HydratedDocument<ReferralAuditEvent>;
export const ReferralAuditEventSchema =
  SchemaFactory.createForClass(ReferralAuditEvent);
