import { Injectable } from '@nestjs/common';
import { ConfigurationRepository } from '../configuration/configuration.repository';
import { MeterRepository } from '../meter/meter.repository';
import { TransactionRepository } from '../transaction/transaction.repository';
import { ScreenerService } from '../screener/screener.service';
import { UserRepository } from '../user/user.repository';
import { CreateMeterConsumptionDto } from './dto/create-meter-consumption.dto';
import { MeterConsumptionRepository } from './meter-consumption.repository';

@Injectable()
export class MeterConsumptionService {
  constructor(
    private readonly meterRepo: MeterRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly configRepo: ConfigurationRepository,
    private readonly meterConsRepo: MeterConsumptionRepository,
    private readonly userRepo: UserRepository,
    private readonly screenerService: ScreenerService,
  ) {}

  async create(organization_id: string, dto: CreateMeterConsumptionDto) {
    const config = await this.configRepo.findOne(organization_id);
    const { meter_name } = await this.meterRepo.findByDevEui(dto.dev_eui);
    const activeUser = await this.userRepo.findActiveUserByMeter(meter_name);
    
    if (dto.last_uplink) {
      await this.meterConsRepo.create({...dto, userId: activeUser[0].id});
    }

    delete dto.last_uplink;
    delete dto.consumed_at;
    const oldMeter = await this.meterRepo.findByDevEui(dto.dev_eui);
    const meter = await this.meterRepo.upsertMeterViaConsumption(dto);

    const transaction = await this.transactionRepo.findByDevEui(dto.dev_eui);

    const isReloaded =
      oldMeter && transaction.status === 'Pending'
        ? oldMeter.allowed_flow + transaction.amount === meter.allowed_flow
        : false;

    if (isReloaded) {
      await this.transactionRepo.updateStatus(
        transaction.reference_no,
        'Successful',
      );
    }

    const isChanged =
      oldMeter !== null ? meter.valve_status !== oldMeter.valve_status : false;

    const users = await this.userRepo.isOwned(meter.meter_name);

    const rate = config.getConsumptionRate(meter.consumer_type);
    const perRate = meter.getWaterMeterRate(rate);
    if (meter) {
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

  async findMeterConsumption(
    devEUI: string,
    created_by_id: string,
    organization_id: string,
    startDate: Date,
    endDate?: Date,
  ) {
    const { meter_name } = await this.meterRepo.findByDevEui(devEUI);
    const user = await this.userRepo.findActiveUserByMeter(meter_name);
    const { data: transactions } =
      await this.transactionRepo.findWhere(0, 10, organization_id, user[0].id, devEUI);

    const response = await this.meterConsRepo.findMeterConsumption(
      user[0].id,
      devEUI,
      startDate,
      endDate,
    );

    const meterConsumption = response.map((res) => {
      return {
        _id: res?._id,
        userId: user[0]._id,
        dev_eui: res.dev_eui,
        iot_meter_id: meter_name,
        created_by: created_by_id,
        current_meter_volume: res.allowed_flow,
        amount: 0,
        createdAt: res.consumed_at,
      };
    });
    const allTransactions = [...meterConsumption, ...transactions];
    allTransactions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return { response: [...allTransactions.slice(0, 10)] };
  }

  generateReports(
    startDate: Date,
    endDate: Date,
    organization_id: string,
    utcOffset: number,
  ) {
    return this.meterConsRepo.generateReports(
      startDate,
      endDate,
      organization_id,
      utcOffset,
    );
  }
}
