import { Module } from '@nestjs/common';
import { MeterModule } from '../meter/meter.module';
import { UserModule } from '../user/user.module';
import { VerifyUsersController } from './verify-users.controller';
// import { VerifyUsersRepository } from './verify-users.repository';
import { VerifyUsersService } from './verify-users.service';

@Module({
  controllers: [VerifyUsersController],
  providers: [VerifyUsersService],
  imports: [MeterModule, UserModule]
})
export class VerifyUsersModule {}
