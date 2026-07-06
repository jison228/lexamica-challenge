import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invitation, InvitationSchema } from './invitation.schema';
import { InvitationRepository } from './invitation.repository';

const model = MongooseModule.forFeature([
  { name: Invitation.name, schema: InvitationSchema },
]);

/** Owns the Invitation entity: its schema, model, and repository. */
@Module({
  imports: [model],
  providers: [InvitationRepository],
  exports: [InvitationRepository, model],
})
export class InvitationsModule {}
