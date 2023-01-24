import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IotService } from 'src/iot/iot.service';
import { MeterModule } from '../meter/meter.module';
import { UserModule } from '../user/user.module';
import { VerifyUsersController } from './verify-users.controller';
// import { VerifyUsersRepository } from './verify-users.repository';
import { VerifyUsersService } from './verify-users.service';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  controllers: [VerifyUsersController],
  providers: [VerifyUsersService, IotService],
  imports: [MeterModule, UserModule, HttpModule, MailerModule]
})
export class VerifyUsersModule {}
