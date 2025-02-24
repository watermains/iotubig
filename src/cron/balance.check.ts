import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { RoleTypes } from 'src/decorators/roles.decorator';
import { ConfigurationRepository } from 'src/module/configuration/configuration.repository';
import {
  MeterConsumption,
  MeterConsumptionDocument,
} from 'src/module/meter-consumption/entities/meter-consumption.schema';
import { Meter, MeterDocument } from 'src/module/meter/entities/meter.schema';
import { ConsumerType } from 'src/module/meter/enum/consumer-type.enum';
import {
  Organization,
  OrganizationDocument,
} from 'src/module/organization/entities/organization.schema';
import { TransactionService } from 'src/module/transaction/transaction.service';
import { User, UserDocument } from 'src/module/user/entities/user.schema';

@Injectable()
export class BalanceCheckService {
  constructor(
    @InjectModel(Meter.name) private readonly meterModel: Model<MeterDocument>,
    @InjectModel(Organization.name)
    private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(MeterConsumption.name)
    private readonly consumptionModel: Model<MeterConsumptionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly configRepo: ConfigurationRepository,
    private readonly transactionService: TransactionService,
  ) {}
  private readonly logger = new Logger(BalanceCheckService.name);

  @Cron(
    process.env.NODE_ENV === 'development'
    // ? '* * * * *'
    ? '00 27 18 * * *'
      : CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT,
      // : '00 00 00 1 * *',
    {
      timeZone: 'Asia/Manila',
    },
  )
  async triggerBalanceCheck() {
    this.logger.debug('CRON: triggerBalanceCheck');
    const organizations = await this.orgModel.find();

    //get first day of last month
    const now = moment().tz('Asia/Manila');
    const previousMonth = now.month() - 1;
    const startDate = this.getFirstDateOfMonth(previousMonth).subtract(
      1,
      'days',
    );
    const startDatePlus = this.getFirstDateOfMonth(previousMonth);
    const endDate = this.getLastDateOfMonth(previousMonth);
    const endDatePlus = this.getLastDateOfMonth(previousMonth).add(1, 'days');
    this.logger.debug(`*************`);
    this.logger.debug(`startDate: ${startDate}`);
    this.logger.debug(`startDate + 1: ${startDatePlus}`);
    this.logger.debug(`*************`);
    this.logger.debug(`endDate: ${endDate}`);
    this.logger.debug(`endDate + 1: ${endDatePlus}`);

    organizations.forEach(async (org) => {
      const orgID = org.id;
      if (!orgID) {
        this.logger.error(`no org id`);
        return;
      }

      const orgMeters = await this.meterModel.find({
        iot_organization_id: orgID,
      });

      const config = await this.configRepo.findOne(orgID);
      if (!config) {
        this.logger.error(`no config`);
        return;
      }

      const commercialRate = config.getConsumptionRate(ConsumerType.Commercial);
      const perCommercialRate = commercialRate / 1000;
      const commercialMinimum =
        // config.minimum_monthly_consumer_deduction / perCommercialRate;
        config.minimum_monthly_consumer_deduction;

      this.logger.debug(`*************`);
      this.logger.debug(`commercialRate: ${commercialRate}`);
      this.logger.debug(`commercialMinimum: ${commercialMinimum}`);

      const residentialRate = config.getConsumptionRate(
        ConsumerType.Residential,
      );
      const perResidentialRate = residentialRate / 1000;
      const residentialMinimum =
        // config.minimum_monthly_consumer_deduction / perResidentialRate;
        config.minimum_monthly_consumer_deduction;

      this.logger.debug(`*************`);
      this.logger.debug(`residentialRate: ${residentialRate}`);
      this.logger.debug(`residentialMinimum: ${residentialMinimum}`);
      this.logger.debug(`*************`);

      this.logger.debug(`meter count: ${orgMeters.length}`);

      orgMeters.forEach(async (val) => {
        let minimum = 0;
        let rate = 0;
        if (val.consumer_type == ConsumerType.Commercial) {
          minimum = Number(commercialMinimum);
          rate = Number(perCommercialRate);
        }
        if (val.consumer_type == ConsumerType.Residential) {
          minimum = Number(residentialMinimum);
          rate = Number(perResidentialRate);
        }

        const userInfo = await this.userModel.findOne({water_meter_id: val.meter_name, isActive: true})

        // const startConsume = await this.consumptionModel.findOne({
        //   dev_eui: val.dev_eui,
        //   consumed_at: {
        //     $gte: startDate,
        //     $lt: startDatePlus,
        //   },
        // });
        // const endConsume = await this.consumptionModel.findOne({
        //   dev_eui: val.dev_eui,
        //   consumed_at: {
        //     $gte: endDate,
        //     $lt: endDatePlus,
        //   },
        // });

        const consumption = await this.consumptionModel.find({
          dev_eui: val.dev_eui,
          userId: userInfo?.id ?? null,
          consumed_at: {
            $gte: startDatePlus,
            $lt: endDatePlus,
          }
        });

        const startConsume = consumption.length && now.format('MM DD YYYY') === endDatePlus.format('MM DD YYYY') ? consumption[0] : null;
        const endConsume = consumption.length && now.format('MM DD YYYY') === endDatePlus.format('MM DD YYYY') ? consumption[consumption.length - 1] : null;

        this.logger.debug(`*************`);

        const hasUser = await this.userModel.findOne({
          water_meter_id: val.meter_name,
        });
        if (!hasUser) {
          this.logger.debug(
            `NO EXISTING USER (orphaned): ${val.meter_name} with DEV EUI: ${val.dev_eui}`,
          );
          return;
        }

        if(hasUser.role === RoleTypes.admin || hasUser.role === RoleTypes.superAdmin) {
          this.logger.debug(
            `USER RESERVED (${hasUser.role}): ${val.meter_name} with DEV EUI: ${val.dev_eui}`,
          );
          return;
        }

        if (startConsume && endConsume) {
          this.logger.debug(
            `evaluating: ${val.meter_name} of type ${val.consumer_type} with DEV EUI: ${val.dev_eui}, tenant email: ${hasUser.email}`,
          );
          const deltaFlow =
            Number(endConsume.cumulative_flow) - Number(startConsume.cumulative_flow);
          this.logger.debug(
            `deltaFlow: ${deltaFlow}; with threshold: ${minimum}L`,
          );

          if (deltaFlow < 0) {
            this.logger.debug(
              `Invalid CUMULATIVE FLOW. Kindly check ${val.meter_name}`,
            );
            this.logger.debug(
              `DELTA = ${deltaFlow} | MINIMUM = ${minimum} | END_CONSUME = ${endConsume.cumulative_flow} | START_CONSUME = ${startConsume.cumulative_flow}`,
            );
            this.logger.debug(
              `END_DATE = ${endConsume.consumed_at} | START_CONSUME = ${startConsume.consumed_at}`,
            );
            this.logger.debug(
              `USER_EMAIL = ${hasUser.email}`,
            );
          }

          if (deltaFlow < minimum) {
            // const normalizedDeductionAmount = rate * (minimum - deltaFlow) * -1;
            const normalizedDeductionAmount = Math.abs(minimum - deltaFlow);
            const displayDeductionAmount = parseFloat(
              normalizedDeductionAmount.toFixed(2),
            );
            //TODO replace ID;
            try {
              this.transactionService.sendBalanceUpdate('-1', orgID, {
                amount: displayDeductionAmount,
                iot_meter_id: val.meter_name,
                dev_eui: val.dev_eui,
              });
              this.logger.debug(
                `DEDUCT METER: ${val.meter_name} with DEV EUI: ${val.dev_eui} with AMOUNT: ${displayDeductionAmount}`,
              );
            } catch (ex) {
              this.logger.debug(
                `Failed to deduct balance in IoT with error ${ex}`,
              );
            }
            this.logger.debug(
              `FOR DEDUCTION: ${val.meter_name} with DEV EUI: ${val.dev_eui} with AMOUNT: ${displayDeductionAmount}`,
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
