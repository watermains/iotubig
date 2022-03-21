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

export class BalanceUpdateDTO {
  balance: string;
}

@Injectable()
export class IotService {
  constructor(private httpService: HttpService) {}
  private readonly logger = new Logger(IotService.name);

  sendOverdrawUpdate(
    device_id: string,
    overdraw_limitation: number,
  ): Observable<AxiosResponse<unknown>> {
    return this.send(
      device_id,
      'SOVERDRAW',
      { data: overdraw_limitation ?? 0 },
      1,
    );
  }

  sendLowBalanceUpdate(
    device_id: string,
    water_alarm_threshold: number,
  ): Observable<AxiosResponse<unknown>> {
    return this.send(
      device_id,
      'SLOWBAL',
      { data: water_alarm_threshold ?? 0 },
      1,
    );
  }

  sendBalanceUpdate(
    device_id: string,
    isTopup: boolean,
    dto: BalanceUpdateDTO,
  ): Observable<AxiosResponse<unknown>> {
    return this.send(
      device_id,
      isTopup ? 'SBALADD' : 'SBALDEDUCT',
      { data: dto.balance },
      1,
    );
  }

  // 1 - open valve
  // 0 - close valve
  sendOpenValveUpdate(wireless_id: string, dto: UpdateMeterValveDto) {
    return this.send(wireless_id, 'SVALVE', { data: dto.is_open ? 1 : 0 }, 1);
  }

  private send(
    device_id: string,
    command: string,
    data: any = {},
    frame_id: number,
  ) {
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
            throw new InternalServerErrorException();
          }

          this.logger.debug(obs.data);
          return obs.data;
        }),
      );
    return res;
  }
}
