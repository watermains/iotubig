import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { IotService } from 'src/iot/iot.service';
import { MailerModule } from 'src/mailer/mailer.module';
import { MeterConsumptionModule } from '../meter-consumption/meter-consumption.module';
import { MeterModule } from '../meter/meter.module';
import { UserModule } from '../user/user.module';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationRepository } from './configuration.repository';
import { ConfigurationService } from './configuration.service';
import {
  Configuration,
  ConfigurationSchema,
} from './entities/configuration.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
    forwardRef(() => MeterModule),
    forwardRef(() => UserModule),
    forwardRef(() => MeterConsumptionModule),
    MailerModule,
    HttpModule,
  ],
  exports: [
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
    ConfigurationRepository,
  ],
  controllers: [ConfigurationController],
  providers: [
    ConfigurationService,
    JwtAuthGuard,
    RolesGuard,
    ConfigurationRepository,
    IotService,
  ],
})
export class ConfigurationModule {}
