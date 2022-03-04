import { Module } from '@nestjs/common';
import { API_KEY, REGION, SECRET } from './mailer.keys';
import { MailerService } from './mailer.service';

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
