import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { configuration } from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FirmsModule } from './firms/firms.module';
import { InvitationsModule } from './invitations/invitations.module';
import { DisputesModule } from './disputes/disputes.module';
import { ReferralsModule } from './referrals/referrals.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('mongoUri'),
      }),
    }),
    FirmsModule,
    AuthModule,
    UsersModule,
    InvitationsModule,
    DisputesModule,
    ReferralsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
