import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config'
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './entities/user.schema';
import { UserRepository } from './user.repository';
import { IsEmailAlreadyExistConstraint } from '../custom-decorators/unique-email.decorator'
import { IsEmailExistConstraint } from '../custom-decorators/exist-email.decorator';
import { IsMatchConstraint } from 'src/custom-decorators/match.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  controllers: [UserController],
  providers: [UserRepository, UserService, IsEmailAlreadyExistConstraint, IsEmailExistConstraint, IsMatchConstraint, JwtAuthGuard, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
