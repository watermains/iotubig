import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MeterConsumption,
  MeterConsumptionSchema,
} from 'src/module/meter-consumption/entities/meter-consumption.schema';
import { MeterConsumptionService } from 'src/module/meter-consumption/meter-consumption.service';
import { MeterConsumptionSeederService } from './consumption.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      { name: MeterConsumption.name, schema: MeterConsumptionSchema },
    ]),
  ],
  providers: [MeterConsumptionSeederService, MeterConsumptionService],
  exports: [MeterConsumptionSeederService],
})
export class MeterConsumptionSeederModule {}
