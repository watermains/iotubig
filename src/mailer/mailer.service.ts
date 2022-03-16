import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import * as temp from 'node-ses';
import { Client } from 'node-ses';
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
  dateTriggered: string;
}
export interface MeterStatusNotificationOptions extends NotificationOptions {
  meterStatus: string;
}

export interface CreditNotificationOptions extends NotificationOptions {
  amount: string;
  balanceStatus: string;
}
@Injectable()
export class MailerService {
  private readonly ses: Client;
  constructor() {
    this.ses = temp.createClient({
      key: process.env.MAIL_API_KEY,
      amazon: `https://email.${process.env.REGION}.amazonaws.com`,
      secret: process.env.SECRET,
    });
  }
  private readonly logger = new Logger(MailerService.name);
  private readonly sender = 'noreply@watermains.net';

  async sendWelcome(firstName: string, email: string) {
    this.sendEmailWithTemplateOptions(
      email,
      'Welcome to IoTubig',
      'welcome.hbs',
      { firstName },
    );
  }

  async sendForgotPassword(firstName: string, email: string, token: string) {
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
      { firstName, link },
    );
  }

  async sendCreditNotification(
    options: CreditNotificationOptions,
    email: string,
    subject: string,
  ) {
    this.sendEmailWithTemplateOptions(email, subject, 'reload.hbs', options);
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

    const send = new Promise((resolve, reject) => {
      this.ses.sendEmail(email, (err, data, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    });

    send
      .then((val) => {
        // console.log(val);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
