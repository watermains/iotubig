import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { MailerService } from 'src/mailer/mailer.service';
import { Configuration } from '../configuration/entities/configuration.schema';
import { UserDocument } from '../user/entities/user.schema';

export interface MeterScreenerInfo {
  perRate: number;
  allowedFlow: number;
  battery_level: number;
  siteName: string;
  meterName: string;
}

@Injectable()
export class ScreenerService {
  constructor(private readonly mailerService: MailerService) { }

  async checkMeters(
    config: Configuration,
    meter: MeterScreenerInfo,
    users: UserDocument[],
  ) {
    const meterName = meter.meterName ?? 'Unspecified';
    const lowThreshold = config.water_alarm_threshold / meter.perRate;
    const belowZeroThreshold = 0;
    const overdrawThreshold = config.overdraw_limitation / meter.perRate;
    const lowBattThreshold = config.battery_level_threshold;
    const messages = [];
    let message = '';
    console.log(`${meter.allowedFlow} < ${overdrawThreshold}`);
    if (meter.allowedFlow <= overdrawThreshold && message == '') {
      message = `Overdrawn Water Limit <meter will be closed>`;
    }
    console.log(`${meter.allowedFlow} < ${belowZeroThreshold}`);
    if (meter.allowedFlow <= belowZeroThreshold && message == '') {
      message = `Below Zero Balance`;
    }
    console.log(`${meter.allowedFlow} < ${lowThreshold}`);
    if (meter.allowedFlow <= lowThreshold && message == '') {
      message = `Low Balance`;
    }
    if (message != '') {
      message += `(${meter.allowedFlow}L)`;
      messages.push(message);
    }

    //CHECK FOR BATTERY THRESHOLD
    if (meter.battery_level <= lowBattThreshold) {
      messages.push('Low Battery');
    }

    if (message != '') {
      if (users !== undefined && users.length > 0) {
        const triggerDate = moment().format('MMMM Do YYYY, h:mm:ss a');

        users.forEach((user) => {
          console.log(user);
          this.mailerService.sendNotification(
            {
              header: `Water Meter (${meterName}) Alert`,
              firstName: `${user.first_name}`,
              dateTriggered: triggerDate,
              messages: messages,
              siteName: meter.siteName,
              meterName: meterName,
            },
            `${user.email}`,
            `Water Meter (${meterName}) Alert`,
          );
        });
      }
    }
  }
}
