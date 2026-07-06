import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Referral, ReferralSchema } from './schemas/referral.schema';
import {
  ReferralAuditEvent,
  ReferralAuditEventSchema,
} from './schemas/referral-audit-event.schema';
import { InvitationsModule } from '../invitations/invitations.module';
import { DisputesModule } from '../disputes/disputes.module';
import { ReferralsService } from './referrals.service';
import { ReferralsReadService } from './referrals-read.service';
import { ReferralsController } from './referrals.controller';
import { ReferralRepository } from './repositories/referral.repository';
import { AuditRepository } from './repositories/audit.repository';

const models = MongooseModule.forFeature([
  { name: Referral.name, schema: ReferralSchema },
  { name: ReferralAuditEvent.name, schema: ReferralAuditEventSchema },
]);

@Module({
  imports: [models, InvitationsModule, DisputesModule],
  controllers: [ReferralsController],
  providers: [
    ReferralsService,
    ReferralsReadService,
    ReferralRepository,
    AuditRepository,
  ],
  exports: [ReferralsService, models],
})
export class ReferralsModule {}
