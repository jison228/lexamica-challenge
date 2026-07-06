import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FirmsService } from './firms.service';
import { Firm, FirmSchema } from './schemas/firm.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Firm.name, schema: FirmSchema }]),
  ],
  providers: [FirmsService],
  exports: [FirmsService, MongooseModule],
})
export class FirmsModule {}
