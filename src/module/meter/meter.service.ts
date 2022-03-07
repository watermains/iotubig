import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Configuration,
  ConfigurationDocument,
} from '../configuration/entities/configuration.schema';
import { ScreenerService } from '../screener/screener.service';
import { User, UserDocument } from '../user/entities/user.schema';
import { CreateMeterIOTDto } from './dto/create-meter-iot.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterValveDto } from './dto/update-meter-valve.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { Meter, MeterDocument } from './entities/meter.schema';
import { ConsumerType } from './enum/consumer-type.enum';
import { MeterStatus } from './enum/meter.status.enum';
import { Stats } from './response/stats';

@Injectable()
export class MeterService {
  constructor(
    @InjectModel(Meter.name)
    private meterModel: Model<MeterDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Configuration.name)
    private configurationModel: Model<ConfigurationDocument>,
    private readonly screenerService: ScreenerService,
  ) {}

  async create(createMeterDto: CreateMeterDto) {
    await this.meterModel.create({
      ...createMeterDto,
    });
    return { message: 'Meter created successfully' };
  }

  async createIoT(
    organization_id: string,
    dto: CreateMeterIOTDto,
  ): Promise<Meter> {
    const config = await this.configurationModel.findOne({ organization_id });
    const meter = await this.meterModel.findOneAndUpdate(
      { dev_eui: dto.dev_eui },
      { ...dto },
      { upsert: true, new: true },
    );
    const users = await this.userModel.find({
      water_meter_id: meter.meter_name,
    });

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
    const configuration = await this.configurationModel.findOne({
      organization_id,
    });

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

    const meters = await this.meterModel
      .find(query)
      .skip(offset)
      .limit(pageSize);

    const total_rows = await this.meterModel.find(query).count();

    return {
      response: {
        meters: meters.map((meter) => {
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
        total_rows,
      },
    };
  }

  async findOne(
    user_id: string,
    organization_id: string,
    meter_name?: string,
    dev_eui?: string,
  ) {
    if (!meter_name && !dev_eui) {
      const { water_meter_id } = await this.userModel.findOne({
        _id: user_id,
      });

      meter_name = water_meter_id;
    }

    const params = {
      meter_name,
      dev_eui,
    };

    Object.keys(params).forEach((key) =>
      params[key] === undefined ? delete params[key] : {},
    );

    const configuration = await this.configurationModel.findOne({
      organization_id,
    });

    const battery_level_threshold = configuration.battery_level_threshold;

    const meter = await this.meterModel.findOne({
      ...params,
      deleted_at: null,
    });

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

  private getStatus(open: boolean, force: boolean): number {
    if (force) {
      if (open) {
        return MeterStatus.open;
      } else {
        return MeterStatus.close;
      }
    } else {
      if (open) {
        return MeterStatus.pendingOpen;
      } else {
        return MeterStatus.pendingClose;
      }
    }
  }

  async updateValve(dto: UpdateMeterValveDto): Promise<unknown> {
    const response = await this.meterModel.findOneAndUpdate(
      { dev_eui: dto.dev_eui },
      { valve_status: this.getStatus(dto.is_open, dto.force) },
      { upsert: false, new: true },
    );

    return { response, message: 'Meter valve status updated successfully' };
  }

  async update(
    devEUI: string,
    updateMeterDto: UpdateMeterDto,
  ): Promise<unknown> {
    const response = await this.meterModel.findOneAndUpdate(
      { dev_eui: devEUI },
      { ...updateMeterDto },
      { upsert: false, new: true },
    );

    return { response, message: 'Meter updated successfully' };
  }

  async upsert(dev_eui: string, dto: CreateMeterIOTDto): Promise<Meter> {
    return await this.meterModel.findOneAndUpdate(
      { dev_eui },
      { ...dto },
      { upsert: true },
    );
  }

  async remove(devEUI: string) {
    const forRemove = await this.meterModel.findOne({ dev_eui: devEUI });
    forRemove.deleted_at = new Date();
    await forRemove.save();
    return { message: 'Meter deleted successfully' };
  }

  async findStats(): Promise<unknown> {
    const stats = new Stats();
    stats.idle = await this.meterModel.count({
      valve_status: MeterStatus.idle,
    });
    stats.open = await this.meterModel.count({
      valve_status: MeterStatus.open,
    });
    stats.close = await this.meterModel.count({
      valve_status: MeterStatus.close,
    });
    stats.fault = await this.meterModel.count({
      valve_status: MeterStatus.fault,
    });
    stats.pending_open = await this.meterModel.count({
      valve_status: MeterStatus.pendingOpen,
    });
    stats.pending_close = await this.meterModel.count({
      valve_status: MeterStatus.pendingClose,
    });
    return { response: stats };
  }

  async generateReports(organization_id: string) {
    const meters = await this.meterModel.find({});

    const configuration = await this.configurationModel.findOne({
      organization_id,
    });

    const data = meters.map((meter) => {
      const consumption_rate = configuration.getConsumptionRate(
        meter.consumer_type,
      );

      const balance = meter.getCubicMeterBalance(consumption_rate);
      return { ...meter.toJSON(), balance };
    });

    const fields = [
      {
        label: 'meter_name',
        value: 'meter_name',
      },
      {
        label: 'site_name',
        value: 'site_name',
      },
      {
        label: 'unit_name',
        value: 'unit_name',
      },
      {
        label: 'consumer_type',
        value: 'consumer_type',
      },
      {
        label: 'balance(cu.m)',
        value: 'balance',
      },
      {
        label: 'battery_level',
        value: 'battery_level',
      },
      {
        label: 'valve_status',
        value: 'valve_status',
      },
      {
        label: 'battery_fault',
        value: 'battery_fault',
      },
      {
        label: 'valve_fault',
        value: 'valve_fault',
      },
      {
        label: 'hall_fault',
        value: 'hall_fault',
      },
      {
        label: 'mag_fault',
        value: 'mag_fault',
      },
      {
        label: 'wireless_device_id',
        value: 'wireless_device_id',
      },
    ];

    return { data, fields };
  }
}
