import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { IotService } from 'src/iot/iot.service';
import { User, UserSchema } from '../user/entities/user.schema';
import { Meter, MeterSchema } from './entities/meter.schema';
import { MeterController } from './meter.controller';
import { MeterRepository } from './meter.repository';
import { MeterService } from './meter.service';
import { MeterCheckConstraint } from 'src/validators/meter.validator';

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
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    HttpModule,
  ],
  controllers: [MeterController],
  providers: [MeterService, MeterRepository, IotService, MeterCheckConstraint],
  exports: [MeterService],
})
export class MeterModule {}
