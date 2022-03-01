import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MeterConsumption,
  MeterConsumptionSchema,
} from 'src/module/meter-consumption/entities/meter-consumption.schema';
import {
  Configuration,
  ConfigurationSchema,
} from 'src/module/configuration/entities/configuration.schema';
import { MeterConsumptionService } from 'src/module/meter-consumption/meter-consumption.service';
import { Meter, MeterSchema } from 'src/module/meter/entities/meter.schema';
import { MeterConsumptionSeederService } from './consumption.service';
import { User, UserSchema } from 'src/module/user/entities/user.schema';
import { ScreenerModule } from 'src/module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      { name: MeterConsumption.name, schema: MeterConsumptionSchema },
    ]),
    MongooseModule.forFeature([{ name: Meter.name, schema: MeterSchema }]),
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ScreenerModule,
  ],
  providers: [MeterConsumptionSeederService, MeterConsumptionService],
  exports: [MeterConsumptionSeederService],
})
export class MeterConsumptionSeederModule {}
