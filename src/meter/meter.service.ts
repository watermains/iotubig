import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { Model } from 'mongoose';
import { CreateMeterIOTDto } from './dto/create-meter-iot.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterValveDto } from './dto/update-meter-valve.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { Meter, MeterDocument } from './entities/meter.schema';

@Injectable()
export class MeterService {
  constructor(
    @InjectModel(Meter.name)
    private meterModel: Model<MeterDocument>,
  ) {}

  async create(createMeterDto: CreateMeterDto): Promise<Meter> {
    return await this.meterModel.create({
      ...createMeterDto,
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

  async updateValve(dto: UpdateMeterValveDto): Promise<Meter | null> {
    //TODO validation
    return await this.meterModel.findOneAndUpdate(
      { dev_eui: dto.dev_eui },
      { valve_status: dto.is_open ? 1 : 0 },
      { upsert: false },
    );
  }

  async update(devEUI: string, updateMeterDto: UpdateMeterDto): Promise<Meter> {
    //TODO validation
    await this.meterModel.findOneAndUpdate(
      { dev_eui: devEUI },
      { ...updateMeterDto },
      { upsert: true },
    );
    return await this.meterModel.findOne({ dev_eui: devEUI });
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
  }

  // dashboard(request) {
  //   return this.meterRepository.dashboard(request)
  // }
}
