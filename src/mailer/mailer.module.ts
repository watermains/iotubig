import { Module } from '@nestjs/common';
import { UserModule } from 'src/module';
import { SmsModule } from 'src/sms/sms.module';
import { API_KEY, REGION, SECRET } from './mailer.keys';
import { MailerService } from './mailer.service';

@Module({
  providers: [MailerService],
  exports: [MailerService],
  imports: [SmsModule]
})
export class MailerModule {}
