import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MongoDBProviderModule } from './database/providers/provider/provider.module';
import {
  ConfigurationSeederModule,
  OrganizationSeederModule,
  AdminSeederModule,
  SeederModule,
} from './database/seeders';
import {
  ConfigurationModule,
  MeterModule,
  MeterConsumptionModule,
  OrganizationModule,
  TransactionModule,
  UserModule,
  ScreenerModule,
  AuthModule,
  LogModule,
  VerifyUsersModule,
} from './module';
import { MailerModule } from './mailer/mailer.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    MongoDBProviderModule,
    AdminSeederModule,
    SeederModule,
    OrganizationSeederModule,
    ConfigurationModule,
    ConfigurationSeederModule,
    MeterModule,
    MeterConsumptionModule,
    OrganizationModule,
    TransactionModule,
    UserModule,
    MailerModule,
    ScreenerModule,
    CronModule,
    AuthModule,
    LogModule,
    VerifyUsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
