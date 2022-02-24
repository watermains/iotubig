import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { observeNotification } from 'rxjs/internal/Notification';
import { UpdateMeterValveDto } from 'src/module/meter/dto/update-meter-valve.dto';
import { isPositive } from 'src/validation';
import { UpdateConfigurationDto } from 'src/module/configuration/dto/update-configuration.dto';

export class BalanceUpdateDTO {
  balance: string;
  constructor(balance) {
    this.balance = balance;
  }
}

@Injectable()
export class IotService {
  constructor(private httpService: HttpService) {}

  //TODO
  sendOverdrawUpdate(
    dto: UpdateConfigurationDto,
  ): Observable<AxiosResponse<unknown>> {
    return this.send(
      'db7e0725-647d-4b54-bd66-0ee6c352feab',
      'SOVERDRAW',
      { data: dto.overdraw_limitation ?? 0 },
      1,
    );
  }

  sendLowBalanceUpdate(
    dto: UpdateConfigurationDto,
  ): Observable<AxiosResponse<unknown>> {
    return this.send(
      'db7e0725-647d-4b54-bd66-0ee6c352feab',
      'SLOWBAL',
      { data: dto.water_alarm_threshold ?? 0 },
      1,
    );
  }

  sendBalanceUpdate(dto: BalanceUpdateDTO): Observable<AxiosResponse<unknown>> {
    return this.send(
      'db7e0725-647d-4b54-bd66-0ee6c352feab',
      isPositive(dto.balance) ? 'SBALADD' : 'SBALDEDUCT',
      { data: dto.balance },
      1,
    );
  }

  // 1 - open valve
  // 0 - close valve
<<<<<<< HEAD
  sendOpenValveUpdate(wireless_id: string, dto: UpdateMeterValveDto) {
    return this.send(
      wireless_id,
=======
  sendOpenValveUpdate(dto: UpdateMeterValveDto) {
    return this.send(
      'db7e0725-647d-4b54-bd66-0ee6c352feab',
>>>>>>> Added Balance Deduction cron job
      'SVALVE',
      { data: dto.is_open ? 1 : 0 },
      1,
    );
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
          return obs.data;
        }),
      );
    return res;
  }
}
