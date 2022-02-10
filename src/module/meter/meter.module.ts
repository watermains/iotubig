import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MeterService } from './meter.service';
import { MeterController } from './meter.controller';
import { MeterRepository } from './meter.repository';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { IotService } from 'src/iot/iot.service';
import { Meter, MeterSchema } from './entities/meter.schema';
import { ValidateMeterMiddleware } from 'src/middleware/meter.middleware';

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
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    HttpModule,
  ],
  controllers: [MeterController],
  providers: [MeterService, MeterRepository, IotService],
  exports: [MeterService],
})
export class MeterModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidateMeterMiddleware)
      .forRoutes(
        { path: '/meter/details', method: RequestMethod.GET },
        { path: '/meter/valve', method: RequestMethod.POST },
        { path: '/meter/:devEUI', method: RequestMethod.PATCH },
        { path: '/meter/:devEUI', method: RequestMethod.DELETE },
      );
  }
}
