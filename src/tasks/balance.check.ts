import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { MailerService } from 'src/mailer/mailer.service';
import {
  Configuration,
  ConfigurationDocument,
} from 'src/module/configuration/entities/configuration.schema';
import { Meter, MeterDocument } from 'src/module/meter/entities/meter.schema';
import {
  Organization,
  OrganizationDocument,
} from 'src/module/organization/entities/organization.schema';

@Injectable()
export class BalanceCheckService {
  constructor(
    @InjectModel(Meter.name) private readonly meterModel: Model<MeterDocument>,
    @InjectModel(Configuration.name)
    private readonly configModel: Model<ConfigurationDocument>,
    @InjectModel(Organization.name)
    private readonly orgModel: Model<OrganizationDocument>,
    @Inject() private readonly mailerService: MailerService,
  ) {}
  private readonly logger = new Logger(BalanceCheckService.name);

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    timeZone: 'Asia/Manila',
  })
  async triggerBalanceCheck() {
    const organizations = await this.orgModel.find();
    organizations.forEach(async (org) => {
      const meters = await this.meterModel.find({});
      const filtered = meters.filter((e) => e.iot_organization_id === org.id!);
      // filtered.forEach();
    });
  }
}
