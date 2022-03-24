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

    delete dto.last_uplink;
    delete dto.consumed_at;
    const oldMeter = await this.meterRepo.findByDevEui(dto.dev_eui);
    const meter = await this.meterRepo.upsertMeterViaConsumption(dto);

    const isChanged =
      oldMeter !== null ? meter.valve_status !== oldMeter.valve_status : false;

    const users = await this.userRepo.isOwned(meter.meter_name);

    const rate = config.getConsumptionRate(meter.consumer_type);
    const perRate = meter.getWaterMeterRate(rate);
    if (consumption) {
      this.screenerService.checkMeters(
        config,
        {
          perRate,
          batteryLevel: meter.battery_level,
          siteName: meter.site_name,
          meterName: meter.meter_name,
          allowedFlow: meter.allowed_flow,
          status: {
            isChanged,
            current: meter.valve_status,
          },
        },
        users,
      );
    }
    return { message: 'Meter Consumption successfully recorded' };
  }

  findMeterConsumption(devEUI: string, startDate: Date, endDate?: Date) {
    return this.meterConsRepo.findMeterConsumption(devEUI, startDate, endDate);
  }

  generateReports(startDate: Date, endDate: Date, organization_id: string) {
    return this.meterConsRepo.generateReports(
      startDate,
      endDate,
      organization_id,
    );
  }
}
