import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as moment from 'moment';
import { catchError, lastValueFrom, map, Observable, throwError } from 'rxjs';
import { IotService } from 'src/iot/iot.service';
import { MailerService } from 'src/mailer/mailer.service';
import { OrganizationService } from '../organization/organization.service';
import { ConfigurationRepository } from '../configuration/configuration.repository';
import { Configuration } from '../configuration/entities/configuration.schema';
import { Action, LogService } from '../log/log.service';
import { MeterRepository } from '../meter/meter.repository';
import { MeterService } from '../meter/meter.service';
import { UserRepository } from '../user/user.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionRepository } from './transaction.repository';
import { ConsumerType } from '../meter/enum/consumer-type.enum';
import { SmsService } from 'src/sms/sms.service';
import { smsTypes } from 'src/sms/constants';
import { MeterConsumptionRepository } from '../meter-consumption/meter-consumption.repository';
import { GetPaymentTransactionDto } from './dto/get_payment_transaction.dto';
import {
  TransactionPaymentCodes,
  TransactionStatus,
} from './enum/transaction.status.enum';
import { CreatePaymentTransactionDto } from './dto/create-payment-transaction.dto';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { RoleTypes } from 'src/decorators/roles.decorator';

@Injectable()
export class TransactionService {
  constructor(
    private readonly repo: TransactionRepository,
    private readonly meterRepo: MeterRepository,
    private readonly configRepo: ConfigurationRepository,
    private readonly mailerService: MailerService,
    private readonly smsService: SmsService,
    private readonly userRepo: UserRepository,
    private readonly iotService: IotService,
    private readonly meterService: MeterService,
    private readonly logService: LogService,
    private readonly orgService: OrganizationService,
    private readonly meterConsumptionRepo: MeterConsumptionRepository,
    private httpService: HttpService,
  ) {}

  async create(
    user_id: string,
    organization_id: string,
    dto: CreateTransactionDto,
    config: Configuration,
  ) {
    const meter = await this.meterRepo.findByDevEui(dto.dev_eui);
    const user = await this.userRepo.findActiveUserByMeter(meter?.meter_name);
    const full_name = `${user[0].first_name} ${user[0].last_name}`;
    const admin = await this.userRepo.findOneByID(user_id);

    const transaction = await this.repo.create(
      user_id,
      user[0]?.id ?? user[0]?._id,
      dto,
      meter,
      config,
      full_name,
      admin.role === RoleTypes.admin
        ? admin.email
        : `${admin.email} via Xendit`,
    );
    if (transaction === undefined) {
      throw new InternalServerErrorException(
        'Transaction not recorded on the application. Contact your administrator.',
      );
    }

    if (transaction !== undefined) {
      //TODO should we update instantly or not?
      // this.meterRepo.updateFlow(meter.dev_eui, transaction.volume);

      const data = {
        volume: transaction.volume,
        amount: transaction.amount,
      };

      if (transaction.volume > 0) {
        //NET positive volume notifications only
        this.logService.create({
          action: Action.reload,
          meter_name: meter.meter_name,
          data: JSON.stringify(data),
          created_by: user_id,
          organization_id,
        });

        const users = await this.userRepo.findActiveUserByMeter(
          meter.meter_name,
        );
        if (users.length != 0) {
          const header = `Water Meter (${meter.meter_name}) Reload`;
          const triggerDate = moment()
            .tz('Asia/Manila')
            .format('MMMM Do YYYY, h:mm:ss a');

          users.forEach(async (user) => {
            const org = await this.orgService.findById(
              user.organization_id.toString(),
            );

            const amount = `Php ${transaction.amount}`;

            this.mailerService.sendCreditNotification(
              {
                header,
                firstName: user.first_name,
                messages: [],
                siteName: transaction.site_name,
                meterName: meter.meter_name,
                orgName: org.name,
                dateTriggered: triggerDate,
                amount,
                balanceStatus: 'credited',
              },
              user.email,
              header,
            );
            if (!!user.phone) {
              this.smsService.sendSms(
                meter.meter_name,
                user.first_name,
                user_id === '-1' ? smsTypes.DEDUCT : smsTypes.RELOAD,
                user.phone,
                amount,
              );
            }
          });
        }
      } else {
        this.logService.create({
          action: Action.deduct,
          meter_name: meter.meter_name,
          data: JSON.stringify(data),
          created_by: user_id,
          organization_id,
        });
      }
      return { message: 'Transaction successfully recorded.' };
    } else {
      throw new BadRequestException('Transaction failed.');
    }
  }

  async findAll(
    offset: number,
    pageSize: number,
    organization_id: string,
  ): Promise<unknown> {
    const { data } = await this.repo.findWhere(
      offset,
      pageSize,
      organization_id,
    );
    const transactions = data.filter(
      (transaction) =>
        moment(transaction.createdAt).format('MM-DD-YYYY') ===
        moment().format('MM-DD-YYYY'),
    );
    const total_amount = transactions.reduce(
      (accumulator: number, transaction: { amount: number }) =>
        (accumulator += transaction.amount),
      0,
    );
    return {
      response: {
        transactions,
        total_rows: transactions.length,
        total_amount,
      },
    };
  }

  async findUser(
    offset: number,
    pageSize: number,

    organization_id: string,
  ): Promise<unknown> {
    const { data: transactions, total_rows } = await this.repo.findWhere(
      offset,
      pageSize,
      organization_id,
    );

    return { response: { transactions, total_rows } };
  }

  async findWhere(
    dev_eui: string,
    offset: number,
    pageSize: number,
    organization_id: string,
  ): Promise<unknown> {
    const { data: transactions, total_rows } = await this.repo.findWhere(
      offset,
      pageSize,
      organization_id,
      dev_eui,
    );

    return { response: { transactions, total_rows } };
  }

  async remove(id: number) {
    return this.repo.remove(id);
  }

  async getTotalAmounts(
    organization_id: string,
    startDate: Date,
    endDate?: Date,
  ): Promise<unknown> {
    return this.repo.getTotalAmounts(organization_id, startDate, endDate);
  }

  async generateReports(
    startDate: Date,
    endDate: Date,
    organization_id: string,
    utcOffset: number,
  ) {
    return this.repo.generateReports(
      startDate,
      endDate,
      organization_id,
      utcOffset,
    );
  }

  async getAllAvailableStatements(userId: string) {
    const dateValues = [];
    const allConsumption =
      await this.meterConsumptionRepo.findMeterConsumptionByUserId(userId);
    allConsumption?.map((consumption) => {
      const date = moment(new Date(consumption.consumed_at));
      const thisMonth = moment().startOf('month');
      const _date = date.format('MMMM YYYY');
      if (
        !dateValues.includes(_date) &&
        date.startOf('month') < thisMonth &&
        dateValues.length < 4
      ) {
        dateValues.push(_date);
      }
    });

    return this.repo.getAllAvailableStatements(userId, dateValues);
  }

  async generateStatements(
    userId: string,
    reportDate: string,
    organization_id: string,
    utcOffset: number,
  ) {
    const user = await this.userRepo.findOneByID(userId);
    const meter = await this.meterRepo.findMeter({
      meter_name: user.water_meter_id,
    });
    const config = await this.configRepo.findOne(organization_id);
    const _startDate = moment(new Date(reportDate))
      .startOf('month')
      .tz('Asia/Manila')
      .toString();
    const _endDate = moment(new Date(reportDate))
      .endOf('month')
      .tz('Asia/Manila')
      .toString();
    const consumptions =
      await this.meterConsumptionRepo.findMeterConsumptionByUserId(
        userId,
        new Date(_startDate),
        new Date(_endDate),
      );

    const rate =
      meter.consumer_type === ConsumerType.Residential
        ? config.residential_consumption_rates
        : config.commercial_consumption_rates;

    return this.repo.generateStatements(
      userId,
      user,
      meter,
      consumptions,
      rate,
      reportDate,
      organization_id,
      utcOffset,
    );
  }

  async sendBalanceUpdate(
    user_id: string,
    organization_id: string,
    dto: CreateTransactionDto,
  ) {
    const meter = await this.meterService.findMeterDetails(
      user_id,
      organization_id,
      undefined,
      dto.dev_eui,
    );

    if (meter === undefined) {
      throw new BadRequestException('No meter found');
    }

    const config = await this.configRepo.findOne(organization_id);
    if (meter.document === undefined) {
      throw new BadRequestException('No configuration found for this meter.');
    }

    if (!meter.document.meter_name) {
      throw new BadRequestException('No meter name found for this meter.');
    }

    if (!meter.document.wireless_device_id) {
      throw new BadRequestException(
        'No wiress device id found for this meter.',
      );
    }

    if (!meter.document.iot_organization_id) {
      throw new BadRequestException('No organization found for this meter.');
    }

    if (meter.document.iot_organization_id.toString() != organization_id) {
      throw new UnauthorizedException();
    }

    return lastValueFrom(
      this.iotService
        .sendBalanceUpdate(
          meter.document.wireless_device_id,
          meter.document.meter_name,
          meter.document.site_name,
          dto.amount > 0 ? true : false,
          { balance: Math.abs(dto.amount).toString() },
        )
        .pipe(
          map((obs) => {
            return this.create(user_id, organization_id, dto, config);
          }),
        ),
    );
  }

  async reloadMeter(
    user_id: string,
    org_id: string,
    dto: CreatePaymentTransactionDto,
  ) {
    const { water_meter_id, first_name, last_name, phone, email } = await this.userRepo.findOneByID(user_id);
    const { dev_eui,  iot_organization_id} = await this.meterRepo.findMeter({
      meter_name: water_meter_id,
    });
    let resp: Promise<AxiosResponse<unknown, any>>;
    switch (dto.payment_channel) {
      case 'GCash':
      case 'Maya':
        resp = lastValueFrom(
          this.createEwalletReload(
            user_id,
            org_id,
            dto,
            water_meter_id,
            dev_eui,
          ).pipe((data) => {
            return data;
          }),
        );
        break;

      case 'Cebuana':
        resp = lastValueFrom(
          this.createOtcReload(
            user_id,
            org_id,
            dto,
            water_meter_id,
            dev_eui,
            `${first_name} ${last_name}`
          ).pipe((data) => {
            return data;
          }),
        );
        break;
          
      default:
        return;
    }

    const response = await resp;
    
    if (!!response['payment_code']) {
      const org = await this.orgService.findById(
        iot_organization_id.toString(),
      );
      const header = `Water Meter (${water_meter_id}) Reload Pending`;
      this.mailerService.sendCreditPendingNotification(
        {
          header,
          firstName: first_name,
          messages: [],
          meterName: water_meter_id,
          orgName: org.name,
          amount: response['amount'],
          paymentCode: response['payment_code'],
          siteName: '',
          dateTriggered: ''
        },
        email,
        header,
      );
      if (!!phone) {
        this.smsService.sendSms(
          water_meter_id,
          first_name,
          smsTypes.PENDING,
          phone,
          response['amount'],
          null,
          null,
          null,
          response['payment_code']
        );
      }
    }
    return { response };
  }

  private createEwalletReload(
    user_id: string,
    org_id: string,
    dto: CreatePaymentTransactionDto,
    water_meter_id: string,
    dev_eui: string,
  ): Observable<AxiosResponse<unknown>> {
    const timeStamp = moment().format('X');

    const btoa64 = btoa(process.env.XENDIT_SECRET);
    const channel_code = TransactionPaymentCodes[dto.payment_channel];
    const response = this.httpService
      .post(
        `${process.env.XENDIT_URL}/ewallets/charges`,
        {
          reference_id: `order-id-${user_id}-${timeStamp}`,
          currency: 'PHP',
          amount: parseFloat(Number(dto.amount).toFixed(2)),
          checkout_method: 'ONE_TIME_PAYMENT',
          channel_code,
          channel_properties: {
            success_redirect_url: `${process.env.CUSTOMER_FRONT_END_URL}/dashboard`,
            failure_redirect_url: `${process.env.CUSTOMER_FRONT_END_URL}/dashboard`,
            cancel_redirect_url: `${process.env.CUSTOMER_FRONT_END_URL}/dashboard`,
          },
          metadata: {
            user_id,
            organization_id: org_id,
            meter_name: water_meter_id,
            dev_eui,
          },
        },
        {
          headers: {
            Authorization: `Basic ${btoa64}`,
          },
        },
      )
      .pipe(
        map((resp) => {
          console.log(resp);
          return resp.data;
        }),
      );
    return response;
  }

  private createOtcReload(
    user_id: string,
    org_id: string,
    dto: CreatePaymentTransactionDto,
    water_meter_id: string,
    dev_eui: string,
    full_name: string,
  ): Observable<AxiosResponse<unknown>> {
    const timeStamp = moment().format('X');

    const btoa64 = btoa(process.env.XENDIT_SECRET);
    const channel_code = TransactionPaymentCodes[dto.payment_channel];
    const response = this.httpService
      .post(
        `${process.env.XENDIT_URL}/payment_codes`,
        {
          reference_id: `order-id-${user_id}-${timeStamp}`,
          currency: 'PHP',
          amount: parseFloat(Number(dto.amount).toFixed(2)),
          channel_code,
          customer_name: full_name,
          market: "PH",
          metadata: {
            user_id,
            organization_id: org_id,
            meter_name: water_meter_id,
            dev_eui,
          },
        },
        {
          headers: {
            Authorization: `Basic ${btoa64}`,
          },
        },
      )
      .pipe(
        map((resp) => {
          console.log(resp);
          return resp.data;
        }),
      );
    return response;
  }

  async ewalletPayment(dto: GetPaymentTransactionDto) {
    const { metadata, status, currency, capture_amount, created } = dto;
    const { dev_eui, meter_name, organization_id, user_id } = metadata;

    const createDto: CreateTransactionDto = {
      amount: capture_amount,
      dev_eui,
      iot_meter_id: meter_name,
    };

    if (status === TransactionStatus.succeeded) {
      this.sendBalanceUpdate(user_id, organization_id, createDto);
    }

    return { paymentStatus: status };
  }

  async otcPayment(dto: GetPaymentTransactionDto) {
    const { metadata, status, currency, capture_amount, created } = dto;
    const { dev_eui, meter_name, organization_id, user_id } = metadata;

    const createDto: CreateTransactionDto = {
      amount: capture_amount,
      dev_eui,
      iot_meter_id: meter_name,
    };

    if (status === TransactionStatus.succeeded) {
      this.sendBalanceUpdate(user_id, organization_id, createDto);
    }

    return { paymentStatus: status };
  }
}
