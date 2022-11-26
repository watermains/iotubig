import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as moment from 'moment';
import { lastValueFrom, map } from 'rxjs';
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

@Injectable()
export class TransactionService {
  constructor(
    private readonly repo: TransactionRepository,
    private readonly meterRepo: MeterRepository,
    private readonly configRepo: ConfigurationRepository,
    private readonly mailerService: MailerService,
    private readonly userRepo: UserRepository,
    private readonly iotService: IotService,
    private readonly meterService: MeterService,
    private readonly logService: LogService,
    private readonly orgService: OrganizationService,
  ) {}

  async create(
    user_id: string,
    organization_id: string,
    dto: CreateTransactionDto,
    config: Configuration,
  ) {
    const meter = await this.meterRepo.findByDevEui(dto.dev_eui);
    const user = await this.userRepo.findActiveUserByMeter(meter?.meter_name);
    const transaction = await this.repo.create(
      user_id,
      user[0]._id,
      dto,
      meter,
      config,
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

            this.mailerService.sendCreditNotification(
              {
                header,
                firstName: user.first_name,
                messages: [],
                siteName: transaction.site_name,
                meterName: meter.meter_name,
                orgName: org.name,
                dateTriggered: triggerDate,
                amount: `Php ${transaction.amount}`,
                balanceStatus: 'credited',
              },
              user.email,
              header,
            );
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
    const { data: transactions, total_rows } = await this.repo.findWhere(
      offset,
      pageSize,
      organization_id,
    );

    return { response: { transactions, total_rows } };
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
    return this.repo.getAllAvailableStatements(
      userId,
    );
  }

  async generateStatements(
    userId: string,
    reportDate: string,
    organization_id: string,
    utcOffset: number,
  ) {
    const {water_meter_id} = await this.userRepo.findOneByID(userId);
    const {consumer_type} = await this.meterRepo.findMeter({meter_name : water_meter_id});
    const config = await this.configRepo.findOne(organization_id);

    const rate = consumer_type === ConsumerType.Residential ? config.residential_consumption_rates : config.commercial_consumption_rates;

    return this.repo.generateStatements(
      water_meter_id,
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
}
