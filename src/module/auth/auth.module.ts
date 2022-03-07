import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from 'src/guard/auth/strategies/apikey.strategy';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { Key, KeySchema } from './key.schema';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, ApiKeyStrategy, AuthRepository],
})
export class AuthModule {}
