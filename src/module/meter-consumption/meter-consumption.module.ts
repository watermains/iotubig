import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MeterConsumptionService } from './meter-consumption.service';
import {
  MeterConsumptionController,
  ExternalMeterConsumptionController,
} from './meter-consumption.controller';
import {
  MeterConsumption,
  MeterConsumptionSchema,
} from './entities/meter-consumption.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ScreenerModule } from '../screener/screener.module';
import {
  Configuration,
  ConfigurationSchema,
} from '../configuration/entities/configuration.schema';
import { User, UserSchema } from '../user/entities/user.schema';
import { Meter, MeterSchema } from '../meter/entities/meter.schema';
import { APIKeyMiddleware } from 'src/middleware/apikey.middleware';
import { MeterRepository } from '../meter/meter.repository';
import { UserRepository } from '../user/user.repository';
import { ConfigurationRepository } from '../configuration/configuration.repository';
import { ConfigurationModule } from '../configuration/configuration.module';
import { MeterModule } from '../meter/meter.module';
import { UserModule } from '../user/user.module';
import { MeterConsumptionRepository } from './meter-consumption.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeatureAsync([
      {
        name: MeterConsumption.name,
        useFactory: async () => {
          const schema = MeterConsumptionSchema;
          return schema;
        },
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    ScreenerModule,
    MeterModule,
    UserModule,
    ConfigurationModule,
  ],
  controllers: [MeterConsumptionController, ExternalMeterConsumptionController],
  providers: [MeterConsumptionService, MeterConsumptionRepository],
})
export class MeterConsumptionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(APIKeyMiddleware)
      .forRoutes({ path: 'meter-consumption', method: RequestMethod.POST });
  }
}
