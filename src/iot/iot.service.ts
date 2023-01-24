import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { UpdateMeterValveDto } from 'src/module/meter/dto/update-meter-valve.dto';
import { MailerService } from 'src/mailer/mailer.service';
import * as moment from 'moment-timezone';

export class BalanceUpdateDTO {
  balance: string;
}

@Injectable()
export class IotService {
  constructor(
    private httpService: HttpService,
    private readonly mailerService: MailerService,
  ) {}
  private readonly logger = new Logger(IotService.name);

  sendOverdrawUpdate(
    device_id: string,
    meterName: string,
    siteName: string,
    overdraw_limitation: number,
  ): Observable<AxiosResponse<unknown>> {
    return this.send(
      device_id,
      meterName,
      siteName,
      'SOVERDRAW',
      { data: overdraw_limitation ?? 0 },
      1,
    );
  }

  sendLowBalanceUpdate(
    device_id: string,
    meterName: string,
    siteName: string,
    water_alarm_threshold: number,
  ): Observable<AxiosResponse<unknown>> {
    return this.send(
      device_id,
      meterName,
      siteName,
      'SLOWBAL',
      { data: water_alarm_threshold ?? 0 },
      1,
    );
  }

  sendBalanceUpdate(
    device_id: string,
    meterName: string,
    siteName: string,
    isTopup: boolean,
    dto: BalanceUpdateDTO,
  ): Observable<AxiosResponse<unknown>> {
    return this.send(
      device_id,
      meterName,
      siteName,
      isTopup ? 'SBALADD' : 'SBALDEDUCT',
      { data: dto.balance },
      1,
    );
  }

  // 1 - open valve
  // 0 - close valve
  sendOpenValveUpdate(
    wireless_id: string,
    meterName: string,
    siteName: string,
    dto: UpdateMeterValveDto,
  ) {
    return this.send(
      wireless_id,
      meterName,
      siteName,
      'SVALVE',
      { data: dto.is_open ? 1 : 0 },
      1,
    );
  }

  sendConsumptionRateUpdate(
    device_id: string,
    meterName: string,
    siteName: string,
    consumption_rate: number,
  ) {
    return this.send(
      device_id,
      meterName,
      siteName,
      'SRATE',
      { data: consumption_rate ?? 20 },
      1,
    );
  }

  sendDefaultMeter(device_id: string, meterName: string, siteName: string) {
    return this.send(
      device_id,
      meterName,
      siteName,
      'SDEFAULT',
      { data: 0 },
      1,
    );
  }

  private send(
    device_id: string,
    meterName: string,
    siteName: string,
    command: string,
    data: any = {},
    frame_id: number,
  ) {
    console.log(`${command}`);
    console.log(`${JSON.stringify(data)}`);
    const res = this.httpService
      .post(process.env.IOT_URL, {
        device_id,
        command,
        ...data,
        frame_id,
      })
      .pipe(
        map((obs) => {
          if (obs.data.errorType) {
            this.logger.error(obs.data);

            const triggerDate = moment()
              .tz('Asia/Manila')
              .format('MMMM Do YYYY, h:mm:ss a');
            this.mailerService.sendErrorAlertNotification(
              {
                header: `Water Meter (${meterName}) Error Alert`,
                siteName: siteName,
                meterName: meterName,
                dateTriggered: triggerDate,
                deviceId: device_id,
                command: command,
                errorCode: '500',
                errorType: obs.data.errorType,
                errorDesc: obs.data.errorMessage,
              },
              `Water Meter (${meterName}) Error Alert`,
            );

            throw new InternalServerErrorException();
          }

          this.logger.debug(obs.data);
          return obs.data;
        }),
      );
    return res;
  }
}
