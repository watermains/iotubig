import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  ConfigurationModule,
  MeterModule,
  TransactionModule,
} from 'src/module';
import { TransactionRepository } from 'src/module/transaction/transaction.repository';
import { TransactionSeederService } from './transaction.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MeterModule,
    TransactionModule,
    ConfigurationModule,
  ],
  providers: [TransactionSeederService, TransactionRepository],
  exports: [TransactionSeederService],
})
export class TransactionSeederModule {}
