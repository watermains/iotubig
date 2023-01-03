import { Injectable } from '@nestjs/common';
import { SNS, config } from 'aws-sdk';
import { smsTypes } from './constants';
import {
  belowZeroBalanceAlert,
  lowBalanceAlert,
  lowBatteryAlert,
  meterStatusAlert,
  overdrawnLimitAlert,
  reloadAlertTemplate,
  reloadDeductionTemplate,
} from './sms.template';

@Injectable()
export class SmsService {
  private readonly sms: SNS;
  constructor() {
    config.update({
      region: process.env.REGION,
      credentials: {
        accessKeyId: process.env.MAIL_API_KEY,
        secretAccessKey: process.env.SECRET,
      },
    });
    this.sms = new SNS({ apiVersion: '2010-03-31' });
  }
  sendSms = async (
    meterName: string,
    user: string,
    smsType: string,
    phone: string,
    amount?: number | string,
    meterStatus?: string,
    balance?: number | string,
    batteryLevel?: number | string,
  ) => {
    if (!!phone) {
      const mobileNumber = phone;
      let msg = '';

      switch (smsType) {
        case smsTypes.RELOAD:
          msg = reloadAlertTemplate({ meterName, user, amount });
          break;
        case smsTypes.DEDUCT:
          msg = reloadDeductionTemplate({ meterName, user, amount });
          break;
        case smsTypes.STATUS:
          msg = meterStatusAlert({ meterName, user, status: meterStatus });
          break;
        case smsTypes.LOW_BALANCE:
          msg = lowBalanceAlert({ meterName, user, balance });
          break;
        case smsTypes.BELOW_ZERO:
          msg = belowZeroBalanceAlert({ meterName, user, balance });
          break;
        case smsTypes.OVERDRAWN:
          msg = overdrawnLimitAlert({ meterName, user, balance });
          break;
        case smsTypes.LOW_BATTERY:
          msg = lowBatteryAlert({ meterName, user, batteryLevel });
          break;
        default:
          break;
      }

      const params = {
        Message: msg,
        PhoneNumber: mobileNumber,
      };

      return this.sms.publish(params, (err, data) => {
        if (err) console.log(err, err.stack);
        // an error occurred
        else console.log(data);
      });
    } 
    return ;
  };
}
