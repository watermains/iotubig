import { Injectable } from '@nestjs/common';
import { MeterConsumptionService } from 'src/module/meter-consumption/meter-consumption.service';

@Injectable()
export class MeterConsumptionSeederService {
  constructor(
    private readonly meterConsumptionService: MeterConsumptionService,
  ) {}
  create() {
    const data = require('./consumption.json');
    const meterData = require('./meters.json');
    return this.meterConsumptionService.seed(data, meterData);
  }
}
