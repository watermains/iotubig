import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';

export class BalanceUpdateDTO {
  balance: string;
  constructor(balance) {
    this.balance = balance;
  }
}

@Injectable()
export class IotService {
  constructor(private httpService: HttpService) {}

  sendBalanceUpdate(dto: BalanceUpdateDTO): Observable<AxiosResponse<Object>> {
    const res = this.httpService
      .post(process.env.IOT_URL, {
        device_id: 'db7e0725-647d-4b54-bd66-0ee6c352feab',
        command: 'SBALADD',
        data: dto.balance,
        frame_id: 1,
      })
      .pipe(
        map((obs) => {
          return obs.data;
        }),
      );
    return res;
  }

  sendOpenValveUpdate(open: boolean) {
    //do something
  }

  getConsumption(start: Date, end: Date) {
    //do something
  }
}
