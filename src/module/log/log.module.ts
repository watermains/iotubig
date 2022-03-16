import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './entities/log.schema';
import { LogController } from './log.controller';
import { LogRepository } from './log.repository';
import { LogService } from './log.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
  ],
  controllers: [LogController],
  providers: [LogRepository, LogService],
  exports: [
    MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
    LogService,
  ],
})
export class LogModule {}
