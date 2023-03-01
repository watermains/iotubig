import { MiddlewareConsumer, Module, RequestMethod, forwardRef } from '@nestjs/common';
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
import { APIKeyMiddleware } from 'src/middleware/apikey.middleware';
import { ConfigurationModule } from '../configuration/configuration.module';
import { MeterModule } from '../meter/meter.module';
import { UserModule } from '../user/user.module';
import { MeterConsumptionRepository } from './meter-consumption.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TransactionModule } from '../transaction/transaction.module';
import { IotService } from 'src/iot/iot.service';
import { HttpModule } from '@nestjs/axios';

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
    forwardRef(() => TransactionModule),
    forwardRef(() => ConfigurationModule),
    ScreenerModule,
    MeterModule,
    UserModule,
    HttpModule,
  ],
  controllers: [MeterConsumptionController, ExternalMeterConsumptionController],
  providers: [MeterConsumptionService, MeterConsumptionRepository, IotService],
  exports:[
    MongooseModule.forFeature([{ name: MeterConsumption.name, schema: MeterConsumptionSchema }]),
    MeterConsumptionService,
    MeterConsumptionRepository,
  ]
})
export class MeterConsumptionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(APIKeyMiddleware)
      .forRoutes({ path: 'meter-consumption', method: RequestMethod.POST });
  }
}
  