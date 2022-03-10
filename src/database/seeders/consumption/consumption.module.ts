import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MeterModule } from 'src/module';
import {
  Configuration,
  ConfigurationSchema,
} from 'src/module/configuration/entities/configuration.schema';
import {
  MeterConsumption,
  MeterConsumptionSchema,
} from 'src/module/meter-consumption/entities/meter-consumption.schema';
import { MeterConsumptionRepository } from 'src/module/meter-consumption/meter-consumption.repository';
import { ScreenerModule } from 'src/module/screener/screener.module';
import { User, UserSchema } from 'src/module/user/entities/user.schema';
import { MeterConsumptionSeederService } from './consumption.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
    MongooseModule.forFeature([
      { name: MeterConsumption.name, schema: MeterConsumptionSchema },
    ]),
    MeterModule,
    ScreenerModule,
  ],
  providers: [MeterConsumptionSeederService, MeterConsumptionRepository],
  exports: [MeterConsumptionSeederService],
})
export class MeterConsumptionSeederModule {}
