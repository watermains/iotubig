import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as Mongoose from 'mongoose';
import { Model } from 'mongoose';
import { RoleTypes } from 'src/decorators/roles.decorator';
import { ConfigurationDocument } from '../configuration/entities/configuration.schema';
import { CreateMeterConsumptionDto } from '../meter-consumption/dto/create-meter-consumption.dto';
import { OrganizationDocument } from '../organization/entities/organization.schema';
import { PaginatedData } from '../pagination/paginate';
import { CreateMeterIOTDto } from './dto/create-meter-iot.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterValveDto } from './dto/update-meter-valve.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { Meter, MeterDocument } from './entities/meter.schema';
import { MeterStatus } from './enum/meter.status.enum';
import { Stats } from './response/stats';

export interface IMeter {
  createMeter(dto: CreateMeterDto);
  updateMeter(devEUI: string, updateMeterDto: UpdateMeterDto);
  updateValve(dto: UpdateMeterValveDto);
  updateFlow(dev_eui: string, volume: number);
  upsertMeterViaIoT(dto: CreateMeterIOTDto);
  upsertMeterViaConsumption(dto: CreateMeterConsumptionDto);
  findByDevEui(dev_eui: string);
  findMeter(whereClause: object);
  findMetersWhere(whereClause: object);
  seed(organization: OrganizationDocument, meterData: CreateMeterDto[]);
  findStats(role: RoleTypes, organization_id: string): Promise<Stats>;
  unlinkMeter(meter: MeterDocument);
  createModel(document: object);
}
@Injectable()
export class MeterRepository implements IMeter {
  constructor(
    @InjectModel(Meter.name) private meterModel: Model<MeterDocument>,
  ) {}

  async createMeter(dto: CreateMeterDto) {
    return await this.meterModel.create({
      ...dto,
    });
  }

  async updateMeter(devEUI: string, updateMeterDto: UpdateMeterDto) {
    return await this.meterModel.findOneAndUpdate(
      { dev_eui: devEUI },
      { ...updateMeterDto },
      { upsert: false, new: true },
    );
  }

  async updateFlow(dev_eui: string, volume: number) {
    const meter = await this.meterModel.findOne({ dev_eui });
    meter.allowed_flow = meter.addFlow(meter.allowed_flow, volume);
    meter.save();
  }

  private getStatus(open: boolean, force: boolean): number {
    if (force) {
      if (open) {
        return MeterStatus.open;
      } else {
        return MeterStatus.closed;
      }
    } else {
      if (open) {
        return MeterStatus.pendingOpen;
      } else {
        return MeterStatus.pendingClose;
      }
    }
  }

  async updateValve(dto: UpdateMeterValveDto) {
    return await this.meterModel.findOneAndUpdate(
      { dev_eui: dto.dev_eui },
      { valve_status: this.getStatus(dto.is_open, dto.force) },
      { upsert: false, new: true },
    );
  }

  async upsertMeterViaIoT(dto: CreateMeterIOTDto) {
    return await this.meterModel.findOneAndUpdate(
      { dev_eui: dto.dev_eui },
      { ...dto },
      { upsert: true, new: true },
    );
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

  async findByDevEui(dev_eui: string) {
    return await this.meterModel.findOne({ dev_eui });
  }

  async findMeter(whereClause: object) {
    return await this.meterModel.findOne(whereClause);
  }

  async unlinkMeter(meter: MeterDocument) {
    meter.site_name = null;
    meter.unit_name = null;
    await meter.save();
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

  async findStats(role: RoleTypes, organization_id?: string): Promise<Stats> {
    const pipeline =
      role == RoleTypes.admin && organization_id
        ? [
            {
              $match: {
                iot_organization_id: new Mongoose.Types.ObjectId(
                  organization_id,
                ),
              },
            },
          ]
        : [];

    const counts = await this.meterModel.aggregate([
      ...pipeline,
      {
        $group: {
          _id: '$valve_status',
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const count: { [key: string]: number } = counts.reduce(
      (accumulator, currentValue) => {
        return { ...accumulator, [currentValue._id]: currentValue.count };
      },
      {},
    );

    const stats = new Stats({
      idle: count[`${MeterStatus.idle}`],
      open: count[`${MeterStatus.open}`],
      close: count[`${MeterStatus.closed}`],
      fault: count[`${MeterStatus.fault}`],
      pending_open: count[`${MeterStatus.pendingOpen}`],
      pending_close: count[`${MeterStatus.pendingClose}`],
    });

    return stats;
  }

  async findAll(
    $match: object,
    $sort: object,
    offset: number,
    pageSize: number,
  ) {
    const pipeline: Mongoose.PipelineStage[] = [
      {
        $lookup: {
          from: 'organizations',
          localField: 'iot_organization_id',
          foreignField: '_id',
          as: 'org',
        },
      },
      {
        $addFields: {
          org: {
            $arrayElemAt: ['$org', 0],
          },
        },
      },
      { $match },
      { $sort: { ...$sort } },
    ];

    const meters = await this.meterModel.aggregate([
      ...pipeline,
      {
        $skip: Number(offset),
      },
      {
        $limit: Number(pageSize),
      },
    ]);

    const count = await this.meterModel.aggregate([
      ...pipeline,
      {
        $count: 'total_rows',
      },
    ]);

    const total_rows = count?.[0]?.total_rows;

    return new PaginatedData(meters, total_rows);
  }

  async findMetersWhere(query: object) {
    return await this.meterModel.find(query);
  }

  async generateReports(
    configuration: ConfigurationDocument,
    organization_id: string,
  ) {
    const meters = await this.meterModel.find({
      iot_organization_id: new Mongoose.Types.ObjectId(organization_id),
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

  createModel(document: object) {
    return new this.meterModel(document);
  }
}
