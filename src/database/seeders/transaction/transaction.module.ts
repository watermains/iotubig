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
import { TransactionRepository } from 'src/module/transaction/transaction.repository';
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
  providers: [TransactionSeederService, TransactionRepository],
  exports: [TransactionSeederService],
})
export class TransactionSeederModule {}
