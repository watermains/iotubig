import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Configuration,
  ConfigurationSchema,
} from 'src/module/configuration/entities/configuration.schema';
import { Meter, MeterSchema } from 'src/module/meter/entities/meter.schema';
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
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
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
  providers: [TransactionSeederService, TransactionService],
  exports: [TransactionSeederService],
})
export class TransactionSeederModule {}
