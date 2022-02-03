import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './customer/user.service';
import { UserController } from './customer/user.controller';
import { User, UserSchema } from './entities/user.schema';
import { UserRepository } from './user.repository';
import { IsEmailAlreadyExistConstraint } from '../custom-decorators/unique-email.decorator';
import { IsEmailExistConstraint } from '../custom-decorators/exist-email.decorator';
import { IsMatchConstraint } from 'src/custom-decorators/match.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminService } from './admin/admin.service';
import { AdminController } from './admin/admin.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
    JwtAuthGuard,
    JwtStrategy,
    AdminService,
  ],
  exports: [UserService, AdminService],
})
export class UserModule {}
