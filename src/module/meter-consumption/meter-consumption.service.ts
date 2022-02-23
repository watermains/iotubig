import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMeterConsumptionDto } from './dto/create-meter-consumption.dto';
import { MeterConsumption } from './entities/meter-consumption.schema';

@Injectable()
export class MeterConsumptionService {
  constructor(
    @InjectModel(MeterConsumption.name)
    private meterConsumptionModel: Model<MeterConsumption>,
  ) {}

  create(dto: CreateMeterConsumptionDto) {
    return this.meterConsumptionModel.create(dto);
  }

  findMeterConsumption(devEUI: string, startDate: Date, endDate: Date) {
    return this.meterConsumptionModel.find({
      dev_eui: devEUI,
      consumed_at: { $gte: startDate, $lte: endDate },
    });
  }
}
