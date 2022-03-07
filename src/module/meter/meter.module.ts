import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { IotService } from 'src/iot/iot.service';
import { APIKeyMiddleware } from 'src/middleware/apikey.middleware';
import { MeterCheckConstraint } from 'src/validators/meter.validator';
import {
  Configuration,
  ConfigurationSchema,
} from '../configuration/entities/configuration.schema';
import { ScreenerModule } from '../screener/screener.module';
import { User, UserSchema } from '../user/entities/user.schema';
import { Meter, MeterSchema } from './entities/meter.schema';
import { ExternalMeterController, MeterController } from './meter.controller';
import { MeterRepository } from './meter.repository';
import { MeterService } from './meter.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeatureAsync([
      {
        name: Meter.name,
        useFactory: async () => {
          const schema = MeterSchema;
          return schema;
        },
      },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    HttpModule,
    ScreenerModule,
  ],
  controllers: [MeterController, ExternalMeterController],
  providers: [MeterService, MeterRepository, IotService, MeterCheckConstraint],
  exports: [MeterService],
})
export class MeterModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(APIKeyMiddleware)
      .forRoutes({ path: 'meter/iot', method: RequestMethod.POST });
  }
}
