import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Configuration,
  ConfigurationDocument,
} from '../configuration/entities/configuration.schema';
import { CreateMeterDto } from '../meter/dto/create-meter.dto';
import { Meter, MeterDocument } from '../meter/entities/meter.schema';
import { OrganizationDocument } from '../organization/entities/organization.schema';
import { ScreenerService } from '../screener/screener.service';
import { User, UserDocument } from '../user/entities/user.schema';
import { CreateMeterConsumptionDto } from './dto/create-meter-consumption.dto';
import {
  MeterConsumption,
  MeterConsumptionDocument,
} from './entities/meter-consumption.schema';

@Injectable()
export class MeterConsumptionService {
  constructor(
    @InjectModel(MeterConsumption.name)
    private meterConsumptionModel: Model<MeterConsumptionDocument>,
    @InjectModel(Meter.name)
    private meterModel: Model<MeterDocument>,
    @InjectModel(Configuration.name)
    private configurationModel: Model<ConfigurationDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly screenerService: ScreenerService,
  ) {}

  async create(organization_id: string, dto: CreateMeterConsumptionDto) {
    const config = await this.configurationModel.findOne({ organization_id });
    const consumption = await this.meterConsumptionModel.create(dto);

    delete dto.is_last;
    delete dto.consumed_at;
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
    const consumed_at: { $gte: Date; $lt?: Date } = { $gte: startDate };

    if (endDate) {
      consumed_at.$lt = endDate;
    }

    return this.meterConsumptionModel.find({
      dev_eui: devEUI,
      consumed_at,
    });
  }

  seed(
    organization: OrganizationDocument,
    data: CreateMeterConsumptionDto[],
    meterData: CreateMeterDto[],
  ) {
    const consumptions = data.map(async (val) => {
      return this.meterConsumptionModel.findOneAndUpdate(
        {
          dev_eui: val.dev_eui,
          consumed_at: val.consumed_at,
        },
        {
          ...val,
        },
        { upsert: true, new: true },
      );
    });

    const meters = meterData.map(async (val) => {
      return this.meterModel.findOneAndUpdate(
        { dev_eui: val.dev_eui },
        { ...val, iot_organization_id: organization.id },
        { upsert: true, new: true },
      );
    });

    const res = Array<Promise<unknown>>();
    res.push(...consumptions);
    res.push(...meters);

    return res;
  }
}
