import { Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard, RolesGuard } from 'src/guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    // }),
  ],
  controllers: [ConfigurationController],
  providers: [ConfigurationService, JwtAuthGuard, RolesGuard],
})
export class ConfigurationModule {}
