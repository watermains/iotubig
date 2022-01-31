import { Module } from '@nestjs/common';
import { MeterService } from './meter.service';
import { MeterController } from './meter.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Meter, MeterSchema } from './entities/meter.entity';

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
  ],
  controllers: [MeterController],
  providers: [MeterService],
})
export class MeterModule {}
