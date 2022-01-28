import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { Meter, MeterDocument } from './entities/meter.entity';

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
      params[key] === undefined ? delete params[key] : {});
    return await this.meterModel.findOne({
      ...params,
      deleted_at: null,
    });
  }

  async update(meter: string, updateMeterDto: UpdateMeterDto): Promise<Meter> {
    console.log(updateMeterDto);
    //TODO validation
    await this.meterModel.findOneAndUpdate(
      { meter_name: meter },
      { ...updateMeterDto },
      { upsert: true },
    );
    return await this.meterModel.findOne({ meter_name: meter });
  }

  async remove(meter: string) {
    const forRemove = await this.meterModel.findOne({ meter_name: meter });
    forRemove.deleted_at = new Date();
    await forRemove.save();
  }
}
