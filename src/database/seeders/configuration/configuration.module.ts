import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationRepository } from 'src/module/configuration/configuration.repository';
import { Configuration, ConfigurationSchema } from 'src/module/configuration/entities/configuration.schema';
import { ConfigurationSeederService } from './configuration.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  providers: [ConfigurationSeederService, ConfigurationRepository],
  exports: [ConfigurationSeederService],
})
export class ConfigurationSeederModule {}
