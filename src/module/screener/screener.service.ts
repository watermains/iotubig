import { Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { MailerService } from 'src/mailer/mailer.service';
import { Configuration } from '../configuration/entities/configuration.schema';
import { Meter } from '../meter/entities/meter.schema';
import { MeterStatus } from '../meter/enum/meter.status.enum';
import { UserDocument } from '../user/entities/user.schema';

export interface MeterStatusInfo {
  isChanged: boolean;
  current?: number;
}
export interface MeterScreenerInfo {
  perRate: number;
  allowedFlow: number;
  battery_level: number;
  siteName: string;
  meterName: string;
  status: MeterStatusInfo;
}

@Injectable()
export class ScreenerService {
  constructor(private readonly mailerService: MailerService) { }

  private readonly logger = new Logger(ScreenerService.name);

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
    this.logger.debug(`EVALUATING: ${meter.meterName}`);
    this.logger.debug(
      `CHECK OVERDRAW: ${meter.allowedFlow} < ${overdrawThreshold} = ${
        meter.allowedFlow < overdrawThreshold
      }`,
    );
    if (meter.allowedFlow <= overdrawThreshold && message == '') {
      message = `Overdrawn Water Limit <meter will be closed>`;
    }
    this.logger.debug(
      `CHECK BELOW ZERO: ${meter.allowedFlow} < ${belowZeroThreshold} = ${
        meter.allowedFlow < belowZeroThreshold
      }`,
    );
    if (meter.allowedFlow <= belowZeroThreshold && message == '') {
      message = `Below Zero Balance`;
    }
    this.logger.debug(
      `CHECK LOW THRESHOLD ${meter.allowedFlow} < ${lowThreshold} = ${
        meter.allowedFlow < lowThreshold
      }`,
    );
    if (meter.allowedFlow <= lowThreshold && message == '') {
      message = `Low Balance`;
    }
    if (message != '') {
      message += `(${meter.allowedFlow}L)`;
      messages.push(message);
    }

    //CHECK FOR BATTERY THRESHOLD
    this.logger.debug(
      `CHECK LOW BATTERY THRESHOLD ${
        meter.battery_level
      } < ${lowBattThreshold} = ${meter.battery_level < lowBattThreshold}`,
    );
    if (meter.battery_level <= lowBattThreshold) {
      messages.push('Low Battery');
    }

    if (messages.length != 0) {
      if (users !== undefined && users.length > 0) {
        const triggerDate = moment().format('MMMM Do YYYY, h:mm:ss a');

        users.forEach((user) => {
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
    this.logger.debug(`CHECK METER STATUS CHANGE ${meter.status.isChanged}`);
    if (meter.status.isChanged) {
      if (users !== undefined && users.length > 0) {
        const triggerDate = moment().format('MMMM Do YYYY, h:mm:ss a');
        const status = meter.status.current;
        if (status === undefined) {
          return;
        }

        let meterStatus = '';
        switch (status) {
          case MeterStatus.open:
            meterStatus = 'opened';
            break;
          case MeterStatus.close:
            meterStatus = 'closed';
            break;
          default:
            meterStatus = '';
            break;
        }

        if (meterStatus === '') {
          return;
        }

        users.forEach((user) => {
          this.mailerService.sendMeterStatusNotification(
            {
              header: `Water Meter (${meterName}) Alert`,
              firstName: `${user.first_name}`,
              dateTriggered: triggerDate,
              messages: [],
              siteName: meter.siteName,
              meterName: meterName,
              meterStatus,
            },
            `${user.email}`,
            `Water Meter (${meterName}) Alert`,
          );
        });
      }
    }
  }
}
