import { Injectable } from '@nestjs/common';
import { ConfigurationRepository } from '../configuration/configuration.repository';
import { MeterRepository } from '../meter/meter.repository';
import { ScreenerService } from '../screener/screener.service';

import { UserRepository } from '../user/user.repository';
import { CreateMeterConsumptionDto } from './dto/create-meter-consumption.dto';
import { MeterConsumptionRepository } from './meter-consumption.repository';

@Injectable()
export class MeterConsumptionService {
  constructor(
    private readonly meterRepo: MeterRepository,
    private readonly configRepo: ConfigurationRepository,
    private readonly meterConsRepo: MeterConsumptionRepository,
    private readonly userRepo: UserRepository,
    private readonly screenerService: ScreenerService,
  ) {}

  async create(organization_id: string, dto: CreateMeterConsumptionDto) {
    const config = await this.configRepo.findOne(organization_id);
    const consumption = await this.meterConsRepo.create(dto);

    delete dto.is_last;
    delete dto.consumed_at;
    const meter = await this.meterRepo.upsertMeterViaConsumption(dto);

    const users = await this.userRepo.isOwned(meter.meter_name);

    const rate = config.getConsumptionRate(meter.consumer_type);
    const perRate = meter.getWaterMeterRate(rate);
    if (consumption) {
      this.screenerService.checkMeters(
        config,
        {
          perRate,
          siteName: meter.site_name,
          meterName: meter.meter_name,
          allowedFlow: meter.allowed_flow,
        },
        users,
      );
    }
    return { message: 'Meter Consumption successfully recorded' };
  }

  findMeterConsumption(devEUI: string, startDate: Date, endDate?: Date) {
    return this.meterConsRepo.findMeterConsumption(devEUI, startDate, endDate);
  }

  async generateReports(startDate: Date, endDate: Date) {
    return this.generateReports(startDate, endDate);
  }
}
