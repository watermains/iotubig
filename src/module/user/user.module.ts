import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './customer/user.service';
import { UserController } from './customer/user.controller';
import { User, UserSchema } from './entities/user.schema';
import { UserRepository } from './user.repository';
import { IsMatchConstraint } from 'src/decorators/match.decorator';
import { AdminService } from './admin/admin.service';
import { AdminController } from './admin/admin.controller';
import { IsEmailAlreadyExistConstraint } from 'src/decorators/unique-email.decorator';
import { IsEmailExistConstraint } from 'src/decorators/exist-email.decorator';
import { MeterCheckConstraint } from 'src/validators/meter.validator';
import { MailerModule } from 'src/mailer/mailer.module';
import { MeterModule } from '../meter/meter.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    forwardRef(() => MeterModule),
    MailerModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    OrganizationModule,
  ],
  controllers: [UserController, AdminController],
  providers: [
    UserRepository,
    UserService,
    IsEmailAlreadyExistConstraint,
    IsEmailExistConstraint,
    IsMatchConstraint,
    AdminService,
    MeterCheckConstraint,
  ],
  exports: [UserService, AdminService, UserRepository],
})
export class UserModule { }
