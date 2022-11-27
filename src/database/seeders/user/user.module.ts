import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/module/user/entities/user.schema';
import { UserSeederService } from './user.service';
import { UserRepository } from 'src/module/user/user.repository';
import { MailerModule } from 'src/mailer/mailer.module';
import { OrganizationModule } from 'src/module/organization/organization.module';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    MailerModule,
    SmsModule,
    OrganizationModule,
  ],
  providers: [UserSeederService, UserRepository],
  exports: [UserSeederService],
})
export class UserSeederModule { }
