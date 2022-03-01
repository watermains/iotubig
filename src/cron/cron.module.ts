import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from 'src/mailer/mailer.module';
import { MailerService } from 'src/mailer/mailer.service';
import { TransactionModule } from 'src/module';
import {
  Configuration,
  ConfigurationSchema,
} from 'src/module/configuration/entities/configuration.schema';
import {
  MeterConsumption,
  MeterConsumptionSchema,
} from 'src/module/meter-consumption/entities/meter-consumption.schema';
import { Meter, MeterSchema } from 'src/module/meter/entities/meter.schema';
import {
  Organization,
  OrganizationSchema,
} from 'src/module/organization/entities/organization.schema';
import { TransactionService } from 'src/module/transaction/transaction.service';
import { User, UserSchema } from 'src/module/user/entities/user.schema';
import { BalanceCheckService } from './balance.check';
import { CronService } from './cron.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meter.name, schema: MeterSchema }]),
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
    ]),
    MongooseModule.forFeature([
      { name: MeterConsumption.name, schema: MeterConsumptionSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TransactionModule,
    MailerModule,
  ],
  providers: [CronService, BalanceCheckService],
})
export class CronModule {}
