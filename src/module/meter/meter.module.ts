import { HttpModule } from '@nestjs/axios';
import { forwardRef, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { IotService } from 'src/iot/iot.service';
import { APIKeyMiddleware } from 'src/middleware/apikey.middleware';
import { MeterCheckConstraint } from 'src/validators/meter.validator';
import { ConfigurationModule } from '../configuration/configuration.module';
import {
  Configuration,
  ConfigurationSchema,
} from '../configuration/entities/configuration.schema';
import { ScreenerModule } from '../screener/screener.module';
import { User, UserSchema } from '../user/entities/user.schema';
import { UserModule } from '../user/user.module';
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
    forwardRef(() => UserModule),
    ConfigurationModule,
    HttpModule,
    ScreenerModule,
  ],
  controllers: [MeterController, ExternalMeterController],
  providers: [MeterService, MeterRepository, IotService, MeterCheckConstraint],
  exports: [
    MongooseModule.forFeature([{ name: Meter.name, schema: MeterSchema }]),
    MeterRepository,
  ],
})
export class MeterModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(APIKeyMiddleware)
      .forRoutes({ path: 'meter/iot', method: RequestMethod.POST });
  }
}
