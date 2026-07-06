import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { Firm } from '../../firms/schemas/firm.schema';

export type UserRole = 'attorney' | 'admin';

/**
 * A platform user acting on behalf of a firm. `firm` is a reference to the
 * Firm collection (populated on read). Password is stored only as a bcrypt
 * hash and never exposed over the wire (see `toPublicUser`).
 */
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: Firm.name, required: true })
  firm: Types.ObjectId;

  @Prop({ required: true, default: 'attorney' })
  role: UserRole;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
