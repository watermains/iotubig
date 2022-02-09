import { Module } from '@nestjs/common';
import { MeterConsumptionService } from './meter-consumption.service';
import { MeterConsumptionController } from './meter-consumption.controller';

@Module({
  controllers: [MeterConsumptionController],
  providers: [MeterConsumptionService],
})
export class MeterConsumptionModule {}
