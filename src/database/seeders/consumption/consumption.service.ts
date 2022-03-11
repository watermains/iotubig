import { Injectable } from '@nestjs/common';
import { MeterConsumptionRepository } from 'src/module/meter-consumption/meter-consumption.repository';
import { MeterConsumptionService } from 'src/module/meter-consumption/meter-consumption.service';
import { MeterRepository } from 'src/module/meter/meter.repository';

@Injectable()
export class MeterConsumptionSeederService {
  constructor(
    private readonly repo: MeterConsumptionRepository,
    private readonly meterRepo: MeterRepository,
  ) {}
  create(organization) {
    const data = require('./consumption.json');
    const meterData = require('./meters.json');

    const res = Array<Promise<unknown>>();
    const consumptions = this.repo.seed(organization, data);
    const meters = this.meterRepo.seed(organization, meterData);
    res.push(...consumptions);
    res.push(...meters);

    return res;
  }
}
