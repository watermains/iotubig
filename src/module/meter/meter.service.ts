import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { off } from 'process';
import { ConfigurationRepository } from '../configuration/configuration.repository';
import { ScreenerService } from '../screener/screener.service';
import { User, UserDocument } from '../user/entities/user.schema';
import { UserRepository } from '../user/user.repository';
import { CreateMeterIOTDto } from './dto/create-meter-iot.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterValveDto } from './dto/update-meter-valve.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { Meter, MeterDocument } from './entities/meter.schema';
import { ConsumerType } from './enum/consumer-type.enum';
import { MeterStatus } from './enum/meter.status.enum';
import { MeterRepository } from './meter.repository';

@Injectable()
export class MeterService {
  constructor(
    @InjectModel(Meter.name)
    private meterModel: Model<MeterDocument>,
    private readonly configRepo: ConfigurationRepository,
    private readonly userRepo: UserRepository,
    private readonly screenerService: ScreenerService,
    private readonly repo: MeterRepository,
  ) {}

  async create(dto: CreateMeterDto) {
    await this.repo.createMeter(dto);
    return { message: 'Meter created successfully' };
  }

  async createIoT(
    organization_id: string,
    dto: CreateMeterIOTDto,
  ): Promise<Meter> {
    const config = await this.configRepo.findOne(organization_id);
    const meter = await this.repo.upsertMeterViaIoT(dto);

    const users = await this.userRepo.isOwned(meter.meter_name);

    const rate = config.getConsumptionRate(meter.consumer_type);
    const perRate = meter.getWaterMeterRate(rate);
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
    return meter;
  }

  async findAll(
    organization_id: string,
    offset: number,
    pageSize: number,
    valve_status?: MeterStatus,
    consumer_type?: ConsumerType,
    search?: string,
  ) {
    const configuration = await this.configRepo.findOne(organization_id);

    const low_balance_threshold = configuration.water_alarm_threshold;
    const battery_level_threshold = configuration.battery_level_threshold;

    const query: {
      deleted_at: null;
      valve_status?: MeterStatus;
      consumer_type?: ConsumerType;
      $or?: unknown[];
    } = {
      deleted_at: null,
    };

    if (valve_status) {
      query.valve_status = valve_status;
    }

    if (consumer_type) {
      query.consumer_type = consumer_type;
    }

    if (search) {
      const fields = ['meter_name', 'site_name', 'unit_name', 'dev_eui'];
      query.$or = fields.map((field) => ({ [field]: new RegExp(search, 'i') }));
    }

    const paginatedData = await this.repo.findAll(query, offset, pageSize);

    return {
      response: {
        meters: paginatedData.data.map((meter) => {
          const consumption_rate = configuration.getConsumptionRate(
            meter.consumer_type,
          );

          const estimated_balance = meter.getEstimatedBalance(consumption_rate);

          return {
            ...meter.toJSON(),
            estimated_balance,
            low_balance_threshold,
            battery_level_threshold,
          };
        }),
        total_rows: paginatedData.total_rows,
      },
    };
  }

  async findMeterDetails(
    user_id: string,
    organization_id: string,
    meter_name?: string,
    dev_eui?: string,
  ) {
    if (!meter_name && !dev_eui) {
      const { water_meter_id } = await this.userRepo.findOneByID(user_id);

      meter_name = water_meter_id;
    }

    const params = {
      meter_name,
      dev_eui,
      deleted_at: null,
    };

    Object.keys(params).forEach((key) =>
      params[key] === undefined ? delete params[key] : {},
    );

    const configuration = await this.configRepo.findOne(organization_id);

    const battery_level_threshold = configuration.battery_level_threshold;

    const meter = await this.repo.findMeter(params);

    if (!meter) {
      throw new NotFoundException('Meter not found');
    }

    const consumption_rate = configuration.getConsumptionRate(
      meter.consumer_type,
    );

    const water_meter_rate = meter.getWaterMeterRate(consumption_rate);
    const estimated_balance = meter.getEstimatedBalance(consumption_rate);

    return {
      document: meter,
      custom_fields: {
        water_meter_rate,
        estimated_balance,
        battery_level_threshold,
      },
    };
  }

  async updateValve(dto: UpdateMeterValveDto): Promise<unknown> {
    const response = await this.repo.updateValve(dto);
    return { response, message: 'Meter valve status updated successfully' };
  }

  async updateMeter(devEUI: string, dto: UpdateMeterDto): Promise<unknown> {
    const response = this.repo.updateMeter(devEUI, dto);
    return { response, message: 'Meter updated successfully' };
  }

  async removeMeter(devEUI: string) {
    await this.repo.removeMeter(devEUI);
    return { message: 'Meter deleted successfully' };
  }

  async findStats() {
    const res = await this.repo.findStats();
    return { response: res };
  }

  async generateReports(organization_id: string) {
    const configuration = await this.configRepo.findOne(organization_id);
    return this.repo.generateReports(configuration);
  }
}
