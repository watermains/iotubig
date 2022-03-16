import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { lastValueFrom, map } from 'rxjs';
import { BalanceUpdateDTO, IotService } from 'src/iot/iot.service';
import { MailerService } from 'src/mailer/mailer.service';
import { ConfigurationRepository } from '../configuration/configuration.repository';
import { MeterRepository } from '../meter/meter.repository';
import { MeterService } from '../meter/meter.service';
import { UserRepository } from '../user/user.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionRepository } from './transaction.repository';

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
  ) {}

  async create(
    user_id: string,
    organization_id: string,
    dto: CreateTransactionDto,
  ) {
    const config = await this.configRepo.findOne(organization_id);
    const meter = await this.meterRepo.findByDevEui(dto.dev_eui);
    const transaction = await this.repo.create(user_id, dto, meter, config);
    if (transaction !== undefined) {
      this.meterRepo.updateFlow(meter.dev_eui, transaction.volume);

      if (transaction.volume > 0) {
        //NET positive volume notifications only
        const users = await this.userRepo.isOwned(meter.meter_name);
        if (users.length != 0) {
          const header = `Water Meter (${meter.meter_name}) Reload`;
          const triggerDate = moment().format('MMMM Do YYYY, h:mm:ss a');

          users.forEach((user) => {
            this.mailerService.sendCreditNotification(
              {
                header,
                firstName: user.first_name,
                messages: [],
                siteName: transaction.site_name,
                meterName: meter.meter_name,
                dateTriggered: triggerDate,
                amount: `Php ${transaction.amount}`,
                balanceStatus: 'credited',
              },
              user.email,
              header,
            );
          });
        }
      }
      return { message: 'Transaction successfully recorded.' };
    } else {
      throw new BadRequestException('Transaction failed.');
    }
  }

  async findAll(offset: number, pageSize: number): Promise<unknown> {
    const { data: transactions, total_rows } = await this.repo.findWhere(
      offset,
      pageSize,
    );

    return { response: { transactions, total_rows } };
  }

  async findWhere(
    dev_eui: string,
    offset: number,
    pageSize: number,
  ): Promise<unknown> {
    const { data: transactions, total_rows } = await this.repo.findWhere(
      offset,
      pageSize,
      dev_eui,
    );

    return { response: { transactions, total_rows } };
  }

  async remove(id: number) {
    return this.repo.remove(id);
  }

  async getTotalAmounts(startDate: Date, endDate?: Date): Promise<unknown> {
    return this.repo.getTotalAmounts(startDate, endDate);
  }

  async generateReports(startDate: Date, endDate: Date) {
    return this.repo.generateReports(startDate, endDate);
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

    return lastValueFrom(
      this.iotService
        .sendBalanceUpdate(
          meter.document.wireless_device_id,
          new BalanceUpdateDTO(dto.amount.toString()),
        )
        .pipe(
          map((obs) => {
            return this.create(user_id, organization_id, dto);
          }),
        ),
    );
  }
}
