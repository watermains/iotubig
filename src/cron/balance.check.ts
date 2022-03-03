import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { IotService } from 'src/iot/iot.service';
import { MailerService } from 'src/mailer/mailer.service';
import {
  Configuration,
  ConfigurationDocument,
} from 'src/module/configuration/entities/configuration.schema';
import {
  MeterConsumption,
  MeterConsumptionDocument,
} from 'src/module/meter-consumption/entities/meter-consumption.schema';
import { Meter, MeterDocument } from 'src/module/meter/entities/meter.schema';
import { ConsumerType } from 'src/module/meter/enum/consumer-type.enum';
import { MeterService } from 'src/module/meter/meter.service';
import {
  Organization,
  OrganizationDocument,
} from 'src/module/organization/entities/organization.schema';
import { CreateTransactionDto } from 'src/module/transaction/dto/create-transaction.dto';
import { TransactionService } from 'src/module/transaction/transaction.service';

@Injectable()
export class BalanceCheckService {
  constructor(
    @InjectModel(Meter.name) private readonly meterModel: Model<MeterDocument>,
    @InjectModel(Configuration.name)
    private readonly configModel: Model<ConfigurationDocument>,
    @InjectModel(Organization.name)
    private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(MeterConsumption.name)
    private readonly consumptionModel: Model<MeterConsumptionDocument>,
    private readonly mailerService: MailerService,
    private readonly transactionService: TransactionService,
  ) {}
  private readonly logger = new Logger(BalanceCheckService.name);

  @Cron(
    process.env.NODE_ENV === 'development'
      ? '*/10 * * * * *'
      : CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT,
    {
      timeZone: 'Asia/Manila',
    },
  )
  async triggerBalanceCheck() {
    this.logger.debug('triggerBalanceCheck');
    const organizations = await this.orgModel.find();

    //get first day of last month
    const now = moment();
    const previousMonth = now.month() - 1;
    const startDate = this.getFirstDateOfMonth(previousMonth);
    const startDatePlus = this.getFirstDateOfMonth(previousMonth).add(1, 'days');
    const endDate = this.getLastDateOfMonth(previousMonth);
    const endDatePlus = this.getLastDateOfMonth(previousMonth).add(1, 'days');
    this.logger.debug(`*************`);
    this.logger.debug(`startDate: ${startDate}`);
    this.logger.debug(`startDate + 1: ${startDatePlus}`);
    this.logger.debug(`*************`);
    this.logger.debug(`endDate: ${endDate}`);
    this.logger.debug(`endDate + 1: ${endDatePlus}`);

    organizations.forEach(async (org) => {
      const meters = await this.meterModel.find({});
      const orgID = org.id;
      if (!orgID) {
        this.logger.error(`no org id`);
        return;
      }

      const config = await this.configModel.findOne({ organization_id: orgID });

      if (!config) {
        this.logger.error(`no config`);
        return;
      }

      const commercialRate = config.getConsumptionRate(ConsumerType.Commercial);
      const perCommercialRate = commercialRate / 1000;
      const commercialMinimum =
        config.minimum_monthly_consumer_deduction / perCommercialRate;

      this.logger.debug(`*************`);
      this.logger.debug(`commercialRate: ${commercialRate}`);
      this.logger.debug(`commercialMinimum: ${commercialMinimum}`);

      const residentialRate = config.getConsumptionRate(
        ConsumerType.Residential,
      );
      const perResidentialRate = residentialRate / 1000;
      const residentialMinimum =
        config.minimum_monthly_consumer_deduction / perResidentialRate;

      this.logger.debug(`*************`);
      this.logger.debug(`residentialRate: ${residentialRate}`);
      this.logger.debug(`residentialMinimum: ${residentialMinimum}`);
      this.logger.debug(`*************`);

      this.logger.debug(`meter count: ${meters.length}`);
      const filtered = meters.filter((e) => e.iot_organization_id === orgID);

      meters.forEach(async (val) => {
        let minimum = 0;
        if (val.consumer_type == ConsumerType.Commercial) {
          minimum = commercialMinimum;
        }
        if (val.consumer_type == ConsumerType.Residential) {
          minimum = residentialMinimum;
        }

        const startConsume = await this.consumptionModel.findOne({
          dev_eui: val.dev_eui,
          consumed_at: {
            $gte: startDate,
            $lt: startDatePlus,
          },
        });
        const endConsume = await this.consumptionModel.findOne({
          dev_eui: val.dev_eui,
          consumed_at: {
            $gte: endDate,
            $lt: endDatePlus,
          },
        });
        this.logger.debug(`*************`);
        if (startConsume && endConsume) {
          this.logger.debug(
            `evaluating: ${val.meter_name} of type ${val.consumer_type} with DEV EUI: ${val.dev_eui}`,
          );
          const deltaFlow =
            endConsume.cumulative_flow - startConsume.cumulative_flow;
          this.logger.debug(
            `deltaFlow: ${deltaFlow}; with threshold: ${minimum}L`,
          );
          if (deltaFlow < minimum) {
            this.transactionService.create('-1', orgID, {
              amount: config.minimum_monthly_consumer_deduction * -1,
              iot_meter_id: val.meter_name,
              dev_eui: val.dev_eui,
            });
            this.logger.debug(
              `FOR DEDUCTION: ${val.meter_name} with DEV EUI: ${val.dev_eui}`,
            );
          } else {
            this.logger.debug(
              `MINIMUM PASSED: ${val.meter_name} with DEV EUI: ${val.dev_eui}`,
            );
          }
        } else {
          this.logger.debug(
            `NO CONSUMPTION: ${val.meter_name} with DEV EUI: ${val.dev_eui}`,
          );
        }
        // no deduction for those meters without consumption records on the start of the month;
      });
    });
  }

  getFirstDateOfMonth(month: number) {
    const now = moment();
    return moment().set({
      year: now.year(),
      month: month,
      date: 1,
      hour: 0,
      minute: 0,
      seconds: 0,
    });
  }

  getLastDateOfMonth(month: number) {
    const now = moment();
    return moment()
      .set({
        year: now.year(),
        month: month + 1,
        date: 1,
        hour: 0,
        minute: 0,
        seconds: 0,
      })
      .subtract(1, 'day');
  }
}
