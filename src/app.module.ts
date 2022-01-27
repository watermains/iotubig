import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CommandModule } from 'nestjs-command';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

import { MeterModule } from './meter/meter.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    UserModule,
    TransactionModule,
    MeterModule,
    CommandModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
