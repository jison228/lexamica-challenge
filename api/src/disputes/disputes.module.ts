import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dispute, DisputeSchema } from './dispute.schema';
import { DisputeRepository } from './dispute.repository';

const model = MongooseModule.forFeature([
  { name: Dispute.name, schema: DisputeSchema },
]);

/** Owns the Dispute entity: its schema, model, and repository. */
@Module({
  imports: [model],
  providers: [DisputeRepository],
  exports: [DisputeRepository, model],
})
export class DisputesModule {}
