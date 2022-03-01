import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Configuration,
  ConfigurationSchema,
} from 'src/module/configuration/entities/configuration.schema';
import {
  MeterConsumption,
  MeterConsumptionSchema,
} from 'src/module/meter-consumption/entities/meter-consumption.schema';
import { MeterConsumptionService } from 'src/module/meter-consumption/meter-consumption.service';
import { Meter, MeterSchema } from 'src/module/meter/entities/meter.schema';
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
    MongooseModule.forFeatureAsync([
      {
        name: Meter.name,
        useFactory: async () => {
          const schema = MeterSchema;
          return schema;
        },
      },
    ]),
    MongooseModule.forFeature([
      { name: MeterConsumption.name, schema: MeterConsumptionSchema },
    ]),
    ScreenerModule,
  ],
  providers: [MeterConsumptionSeederService, MeterConsumptionService],
  exports: [MeterConsumptionSeederService],
})
export class MeterConsumptionSeederModule {}
