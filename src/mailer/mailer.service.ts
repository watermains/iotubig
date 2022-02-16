import { Inject, Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';
import * as temp from 'node-ses';
import { Client } from 'node-ses';
import { API_KEY, REGION, SECRET } from './mailer.keys';

import * as fs from 'fs';
import { rejects } from 'assert';
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

  async sendWelcome(
    firstName: string,
    options: EmailOptions,
  ): Promise<boolean> {
    // const res = await new Promise<string>((resolve, reject) => {

    const dirContents = await fs.promises.readdir('src/mailer/templates/');
    const res = fs.readFileSync(
      path.resolve('src/mailer/templates/', 'welcome.hbs'),
    );
    // const res2 = fs.readFileSync(
    //   path.resolve('src/mailer/templates/', 'welcome.hbs'),
    // );

    const template = Handlebars.compile(res.toString());
    options.html = template({ firstName });
    return this.sendEmail(options);
  }

  private sendEmail(options: EmailOptions): Promise<boolean> {
    const email = {
      ...options,
      message: options.html,
    };
    delete email.html;

    if (!email.message) {
      delete email.message;
    }

    return new Promise((resolve, reject) => {
      this.ses.sendEmail(email, (err, data, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    });
  }
}
