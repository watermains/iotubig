import { SES } from '@aws-sdk/client-ses';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import * as path from 'path';

export interface EmailOptions {
  to?: string;
  from: string;
  subject: string;
  html?: string;
  altText?: string;
  cc?: string;
  bcc?: string[];
  replyTo?: string;
}

export interface NotificationOptions {
  header: string;
  firstName: string;
  messages: string[];
  siteName: string;
  meterName: string;
  orgName: string;
  dateTriggered: string;
}

export interface ErrorAlertNotificationOptions {
  header: string;
  siteName: string;
  meterName: string;
  dateTriggered: string;
  deviceId: string;
  command: string;
  errorCode: string;
  errorType: string;
  errorDesc: string;
}

export interface EmailVerificationOptions {
  header: string;
  userId: string;
  adminName: string;
  newUserAccount: string;
  meterName: string;
  orgName: string;
  redirectUrl: string; 
}

export interface MeterStatusNotificationOptions extends NotificationOptions {
  meterStatus: string;
}

export interface CreditNotificationOptions extends NotificationOptions {
  amount: string;
  balanceStatus: string;
}

export interface CreditPendingNotificationOptions extends NotificationOptions {
  amount: string;
  paymentCode: string;
}

@Injectable()
export class MailerService {
  private readonly ses: SES;
  constructor() {
    this.ses = new SES({
      credentials: {
        accessKeyId: process.env.MAIL_API_KEY,
        secretAccessKey: process.env.SECRET,
      },
      region: process.env.REGION,
    });
  }
  private readonly logger = new Logger(MailerService.name);
  private readonly sender = 'noreply@watermains.net';

  async sendWelcome(firstName: string, email: string, orgName: string) {
    this.sendEmailWithTemplateOptions(
      email,
      'Welcome to IoTubig',
      'welcome.hbs',
      { firstName, orgName },
    );
  }

  async sendForgotPassword(firstName: string, email: string, orgName: string, token: string) {
    // Safely join URLs
    const url = new URL(
      path.join(
        process.env.CUSTOMER_FRONT_END_URL,
        process.env.RESET_PASSWORD_PATH,
      ),
    ).toString();

    const link = new URL(path.join(url, token)).toString();

    this.sendEmailWithTemplateOptions(
      email,
      'Reset your password',
      'reset_password.hbs',
      { firstName, orgName, link },
    );
  }

  async sendEmailVerification(
    options: EmailVerificationOptions,
    email: string,
    subject: string,
  ) {
    this.sendEmailWithTemplateOptions(email, subject, 'verify_account.hbs', options);
  }

  async sendCreditNotification(
    options: CreditNotificationOptions,
    email: string,
    subject: string,
  ) {
    this.sendEmailWithTemplateOptions(email, subject, 'reload.hbs', options);
  }

  async sendCreditPendingNotification(
    options: CreditPendingNotificationOptions,
    email: string,
    subject: string,
  ) {
    this.sendEmailWithTemplateOptions(email, subject, 'reload_pending.hbs', options);
  }

  async sendNotification(
    options: NotificationOptions,
    email: string,
    subject: string,
  ) {
    this.sendEmailWithTemplateOptions(
      email,
      subject,
      'balance_alert.hbs',
      options,
    );
  }

  async sendErrorAlertNotification(
    options: ErrorAlertNotificationOptions,
    subject: string,
  ) {
    this.sendEmailWithTemplateOptions(
      'dev@umpisa.co',
      subject,
      'error_alert.hbs',
      options,
    );
  }

  async sendMeterStatusNotification(
    options: MeterStatusNotificationOptions,
    email: string,
    subject: string,
  ) {
    this.sendEmailWithTemplateOptions(
      email,
      subject,
      'meter_valve.hbs',
      options,
    );
  }

  private fetchTemplate(name) {
    const mailerPath = path.join(__dirname, '/templates/');
    return fs.readFileSync(path.resolve(mailerPath, name));
  }

  private sendEmailWithTemplateOptions(
    email: string,
    subject: string,
    templateName: string,
    templateOptions: object,
  ) {
    this.logger.debug(templateOptions);
    const res = this.fetchTemplate(templateName);

    const emailOptions: EmailOptions = {
      from: this.sender,
      subject: subject,
      to: email,
    };

    const template = Handlebars.compile(res.toString());
    emailOptions.html = template(templateOptions);

    this.sendEmail(emailOptions);
  }

  private sendEmail(options: EmailOptions) {
    const email = {
      ...options,
      message: options.html,
    };
    delete email.html;

    if (!email.message) {
      delete email.message;
    }

    const input = {
      Source: options.from,
      Destination: {
        ToAddresses: [options.to],
      },
      Message: {
        Body: {
          Html: {
            Data: options.html,
          },
        },
        Subject: {
          Data: options.subject,
        },
      },
    };

    this.ses
      .sendEmail(input)
      .then((val) => {
        this.logger.debug(val);
      })
      .catch((err) => {
        this.logger.error(`CODE: ${err.Error.Code} TYPE: ${err.Error.Type}`);
        this.logger.error(`MESSAGE: ${err.Error.Message}`);
      });
    // const send = new Promise((resolve, reject) => {
    //   this.ses.sendEmail(a, (err, data, res) => {
    //     if (err) {
    //       return reject(err);
    //     }
    //     return resolve(res);
    //   });
    // });

    // send
    //   .then((val) => {
    //     // console.log(val);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  }
}
