import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMeterConsumptionDto } from '../meter-consumption/dto/create-meter-consumption.dto';
import { OrganizationDocument } from '../organization/entities/organization.schema';
import { CreateMeterDto } from './dto/create-meter.dto';
import { Meter, MeterDocument } from './entities/meter.schema';

@Injectable()
export class MeterRepository {
  constructor(
    @InjectModel(Meter.name) private meterModel: Model<MeterDocument>,
    private jwtService: JwtService,
  ) {}

  async findByDevEui(dev_eui: string) {
    return await this.meterModel.findOne({ dev_eui });
  }

  async upsertMeterViaConsumption(
    dto: CreateMeterConsumptionDto,
  ): Promise<MeterDocument> {
    return await this.meterModel.findOneAndUpdate(
      { dev_eui: dto.dev_eui },
      { ...dto },
      { upsert: true, new: true },
    );
  }

  async findMeter(whereClause: Map<string, unknown>) {
    return await this.meterModel.findOne(whereClause);
  }

  seed(
    organization: OrganizationDocument,
    meterData: CreateMeterDto[],
  ): Promise<MeterDocument>[] {
    return meterData.map(async (val) => {
      return this.meterModel.findOneAndUpdate(
        { dev_eui: val.dev_eui },
        { ...val, iot_organization_id: organization.id },
        { upsert: true, new: true },
      );
    });
  }
}
