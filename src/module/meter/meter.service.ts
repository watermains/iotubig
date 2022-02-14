import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMeterIOTDto } from './dto/create-meter-iot.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterValveDto } from './dto/update-meter-valve.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { Meter, MeterDocument } from './entities/meter.schema';
import { MeterStatus } from './enum/meter.status.enum';
import { Stats } from './response/stats';

@Injectable()
export class MeterService {
  constructor(
    @InjectModel(Meter.name)
    private meterModel: Model<MeterDocument>,
  ) {}

  async create(createMeterDto: CreateMeterDto) {
    await this.meterModel.create({
      ...createMeterDto,
    });
    return { message: 'Meter created successfully' };
  }

  async createIoT(createMeterIOTDto: CreateMeterIOTDto): Promise<Meter> {
    return await this.meterModel.create({
      ...createMeterIOTDto,
    });
  }

  async findAll(): Promise<Meter[]> {
    return await this.meterModel.find({
      deleted_at: null,
    });
  }

  async findOne(meter: string, devEUI: string) {
    const params = {
      meter_name: meter,
      dev_eui: devEUI,
    };
    Object.keys(params).forEach((key) =>
      params[key] === undefined ? delete params[key] : {},
    );
    return await this.meterModel.findOne({
      ...params,
      deleted_at: null,
    });
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

  // dashboard(request) {
  //   return this.meterRepository.dashboard(request)
  // }
}
