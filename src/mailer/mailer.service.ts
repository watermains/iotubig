import { Injectable } from '@nestjs/common';
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

  private readonly sender = 'noreply@watermains.net';

  async sendWelcome(firstName: string, email: string) {
    const emailOptions: EmailOptions = {
      from: this.sender,
      subject: 'Welcome to IoTubig',
      to: email,
    };

    const res = this.fetchTemplate('welcome.hbs');

    const template = Handlebars.compile(res.toString());
    emailOptions.html = template({ firstName });

    this.sendEmail(emailOptions);
  }

  async sendForgotPassword(firstName: string, email: string, token: string) {
    const emailOptions: EmailOptions = {
      from: this.sender,
      subject: 'Reset your password',
      to: email,
    };
    const res = this.fetchTemplate('reset_password.hbs');

    const template = Handlebars.compile(res.toString());

    // Safely join URLs
    const url = new URL(
      path.join(
        process.env.CUSTOMER_FRONT_END_URL,
        process.env.RESET_PASSWORD_PATH,
      ),
    ).toString();

    const link = new URL(path.join(url, token)).toString();

    emailOptions.html = template({ firstName, link });

    this.sendEmail(emailOptions);
  }

  async sendNotification(
    options: NotificationOptions,
    email: string,
    subject: string,
  ) {
    console.log(options);
    const emailOptions: EmailOptions = {
      from: this.sender,
      subject: subject,
      to: email,
    };
    const res = this.fetchTemplate('balance_alert.hbs');

    const template = Handlebars.compile(res.toString());
    emailOptions.html = template(options);

    this.sendEmail(emailOptions);
  }

  private fetchTemplate(name) {
    return fs.readFileSync(path.resolve('src/mailer/templates/', name));
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
