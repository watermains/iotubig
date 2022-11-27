import { Module } from '@nestjs/common';
import { MailerModule } from 'src/mailer/mailer.module';
import { MailerService } from 'src/mailer/mailer.service';
import { SmsModule } from 'src/sms/sms.module';
import { OrganizationModule } from '../organization/organization.module';
import { ScreenerService } from './screener.service';

@Module({
  imports: [MailerModule, OrganizationModule, SmsModule],
  providers: [ScreenerService, MailerService],
  exports: [ScreenerService, MailerService],
})
export class ScreenerModule { }
