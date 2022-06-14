import { Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment-timezone';

import { MailerService } from 'src/mailer/mailer.service';
import { OrganizationService } from '../organization/organization.service';
import { Configuration } from '../configuration/entities/configuration.schema';
import { MeterStatus } from '../meter/enum/meter.status.enum';
import { UserDocument } from '../user/entities/user.schema';

export interface MeterStatusInfo {
  isChanged: boolean;
  current?: number;
}
export interface MeterScreenerInfo {
  perRate: number;
  allowedFlow: number;
  batteryLevel: number;
  siteName: string;
  meterName: string;
  status: MeterStatusInfo;
}

@Injectable()
export class ScreenerService {
  constructor(private readonly mailerService: MailerService, private readonly orgService: OrganizationService) { }

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
      `CHECK OVERDRAW: ${meter.allowedFlow} < ${overdrawThreshold} = ${meter.allowedFlow < overdrawThreshold
      }`,
    );
    if (meter.allowedFlow <= overdrawThreshold && message == '') {
      message = `Overdrawn Water Limit <meter will be closed>`;
    }
    this.logger.debug(
      `CHECK BELOW ZERO: ${meter.allowedFlow} < ${belowZeroThreshold} = ${meter.allowedFlow < belowZeroThreshold
      }`,
    );
    if (meter.allowedFlow <= belowZeroThreshold && message == '') {
      message = `Below Zero Balance`;
    }
    this.logger.debug(
      `CHECK LOW THRESHOLD ${meter.allowedFlow} < ${lowThreshold} = ${meter.allowedFlow < lowThreshold
      }`,
    );
    if (meter.allowedFlow <= lowThreshold && message == '') {
      message = `Low Balance`;
    }
    if (message != '') {
      message += ` (${meter.allowedFlow} Php)`;
      messages.push(message);
    }

    //CHECK FOR BATTERY THRESHOLD
    this.logger.debug(
      `CHECK LOW BATTERY THRESHOLD ${meter.batteryLevel
      } < ${lowBattThreshold} = ${meter.batteryLevel < lowBattThreshold}`,
    );
    if (meter.batteryLevel <= lowBattThreshold) {
      messages.push(`Low Battery ${meter.batteryLevel}%`);
    }

    if (messages.length != 0) {
      if (users !== undefined && users.length > 0) {
        const triggerDate = moment()
          .tz('Asia/Manila')
          .format('MMMM Do YYYY, h:mm:ss a');

        users.forEach(async (user) => {
          const org = await this.orgService.findById(
            user.organization_id.toString(),
          );

          this.mailerService.sendNotification(
            {
              header: `Water Meter (${meterName}) Alert`,
              firstName: `${user.first_name}`,
              dateTriggered: triggerDate,
              messages: messages,
              siteName: meter.siteName,
              meterName: meterName,
              orgName: org.name,
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
        let header = '';
        switch (status) {
          case MeterStatus.open:
            meterStatus = 'opened';
            header = `Water Meter (${meterName}) Opened`;
            break;
          case MeterStatus.closed:
            meterStatus = 'closed';
            header = `Water Meter (${meterName}) Closed`;
            break;
          default:
            meterStatus = '';
            header = `Water Meter (${meterName})`;
            break;
        }

        if (meterStatus === '') {
          return;
        }

        users.forEach(async (user) => {
          const org = await this.orgService.findById(
            user.organization_id.toString(),
          );

          this.mailerService.sendMeterStatusNotification(
            {
              header: header,
              firstName: `${user.first_name}`,
              dateTriggered: triggerDate,
              messages: [],
              siteName: meter.siteName,
              meterName: meterName,
              meterStatus,
              orgName: org.name,
            },
            `${user.email}`,
            header,
          );
        });
      }
    }
  }
}
