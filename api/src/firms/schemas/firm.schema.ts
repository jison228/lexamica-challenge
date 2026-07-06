import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * A law firm on the platform. Users belong to a firm, and referrals are placed
 * by / routed to firms. Keeping it a real collection (rather than a string on
 * the user) is what lets the referral domain reference firms as first-class
 * entities — candidate lists, fee splits, and conflict checks are all
 * firm-to-firm.
 */
@Schema({ timestamps: true })
export class Firm {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  // Stable, human-readable identifier (handy for URLs, logs, seeds).
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;
}

export type FirmDocument = HydratedDocument<Firm>;
export const FirmSchema = SchemaFactory.createForClass(Firm);
