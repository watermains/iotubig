import { Injectable } from '@nestjs/common';
import { CreateMeterConsumptionDto } from './dto/create-meter-consumption.dto';
import { UpdateMeterConsumptionDto } from './dto/update-meter-consumption.dto';

@Injectable()
export class MeterConsumptionService {
  create(createMeterConsumptionDto: CreateMeterConsumptionDto) {
    return 'This action adds a new meterConsumption';
  }

  findAll() {
    return `This action returns all meterConsumption`;
  }

  findOne(id: number) {
    return `This action returns a #${id} meterConsumption`;
  }

  update(id: number, updateMeterConsumptionDto: UpdateMeterConsumptionDto) {
    return `This action updates a #${id} meterConsumption`;
  }

  remove(id: number) {
    return `This action removes a #${id} meterConsumption`;
  }
}
