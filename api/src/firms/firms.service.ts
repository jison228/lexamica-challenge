import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Firm, FirmDocument } from './schemas/firm.schema';

@Injectable()
export class FirmsService {
  constructor(
    @InjectModel(Firm.name) private readonly firmModel: Model<FirmDocument>,
  ) {}

  findById(id: string): Promise<FirmDocument | null> {
    return this.firmModel.findById(id).exec();
  }

  findAll(): Promise<FirmDocument[]> {
    return this.firmModel.find().sort({ name: 1 }).exec();
  }
}
