import { Module } from '@nestjs/common';
import { MeterConsumptionService } from './meter-consumption.service';
import { MeterConsumptionController } from './meter-consumption.controller';
import {
  MeterConsumption,
  MeterConsumptionSchema,
} from './entities/meter-consumption.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ScreenerModule } from '../screener/screener.module';
import {
  Configuration,
  ConfigurationSchema,
} from '../configuration/entities/configuration.schema';
import { User, UserSchema } from '../user/entities/user.schema';
import { Meter, MeterSchema } from '../meter/entities/meter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: Meter.name,
        useFactory: async () => {
          const schema = MeterSchema;
          return schema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: MeterConsumption.name,
        useFactory: async () => {
          const schema = MeterConsumptionSchema;
          return schema;
        },
      },
    ]),
    ScreenerModule,
  ],
  controllers: [MeterConsumptionController],
  providers: [MeterConsumptionService],
})
export class MeterConsumptionModule {}
