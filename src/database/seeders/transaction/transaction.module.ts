import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Transaction,
  TransactionSchema,
} from 'src/module/transaction/entities/transaction.schema';
import { TransactionService } from 'src/module/transaction/transaction.service';
import { TransactionSeederService } from './transaction.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [TransactionSeederService, TransactionService],
  exports: [TransactionSeederService],
})
export class TransactionSeederModule {}
