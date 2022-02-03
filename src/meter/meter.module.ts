import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MeterService } from './meter.service';
import { MeterController } from './meter.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Meter, MeterSchema } from './entities/meter.entity';
import { IotService } from 'src/iot/iot.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Meter.name,
        useFactory: async () => {
          const schema = MeterSchema;
          return schema;
        },
      },
    ]),
    HttpModule,
  ],
  controllers: [MeterController],
  providers: [MeterService, IotService],
})
export class MeterModule {}
