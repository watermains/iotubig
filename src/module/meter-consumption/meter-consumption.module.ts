import { Module } from '@nestjs/common';
import { MeterConsumptionService } from './meter-consumption.service';
import { MeterConsumptionController } from './meter-consumption.controller';
import {
  MeterConsumption,
  MeterConsumptionSchema,
} from './entities/meter-consumption.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: MeterConsumption.name,
        useFactory: async () => {
          const schema = MeterConsumptionSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [MeterConsumptionController],
  providers: [MeterConsumptionService],
})
export class MeterConsumptionModule {}
