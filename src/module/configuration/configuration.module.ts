import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { MailerModule } from 'src/mailer/mailer.module';
import { User, UserSchema } from '../user/entities/user.schema';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationRepository } from './configuration.repository';
import { ConfigurationService } from './configuration.service';
import {
  Configuration,
  ConfigurationSchema,
} from './entities/configuration.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    MailerModule,
  ],
  exports: [
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
    ConfigurationRepository,
  ],
  controllers: [ConfigurationController],
  providers: [
    ConfigurationService,
    JwtAuthGuard,
    RolesGuard,
    ConfigurationRepository,
  ],
})
export class ConfigurationModule {}
