import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';

export class BalanceUpdateDTO {
  constructor(private balance: string) {}
}

@Injectable()
export class IotService {
  constructor(private httpService: HttpService) {}

  sendBalanceUpdate(dto: BalanceUpdateDTO): Observable<AxiosResponse<Object>> {
    const res = this.httpService
      .post(
        'https://le6bzf16ac.execute-api.ap-northeast-1.amazonaws.com/test/devices',
      )
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
