import { Module } from '@nestjs/common';
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
import { MeterNameExistConstraint } from 'src/validators/exist-meter.validator';
import { Meter, MeterSchema } from '../meter/entities/meter.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Meter.name, schema: MeterSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  controllers: [UserController, AdminController],
  providers: [
    UserRepository,
    UserService,
    IsEmailAlreadyExistConstraint,
    IsEmailExistConstraint,
    IsMatchConstraint,
    AdminService,
    MeterNameExistConstraint,
  ],
  exports: [UserService, AdminService],
})
export class UserModule {}
