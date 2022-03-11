import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { IotService } from 'src/iot/iot.service';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './entities/transaction.schema';
import { HttpModule } from '@nestjs/axios';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { Meter, MeterSchema } from 'src/module/meter/entities/meter.schema';
import { TransactionRepository } from './transaction.repository';
import { ConfigurationModule } from '../configuration/configuration.module';
import { MeterModule } from '../meter/meter.module';

@Module({
  imports: [
    ConfigurationModule,
    MeterModule,
    MongooseModule.forFeatureAsync([
      {
        name: Transaction.name,
        useFactory: async (connection) => {
          const schema = TransactionSchema;
          const AutoIncrement = AutoIncrementFactory(connection);
          schema.plugin(AutoIncrement, {
            inc_field: 'reference_no',
          });
          schema.pre('save', function (next) {
            // this.created_by = this.$locals.user_id;
            next();
          });
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    HttpModule,
  ],
  controllers: [TransactionController],
  exports: [
    TransactionRepository,
    MongooseModule.forFeatureAsync([
      {
        name: Transaction.name,
        useFactory: async (connection) => {
          const schema = TransactionSchema;
          const AutoIncrement = AutoIncrementFactory(connection);
          schema.plugin(AutoIncrement, {
            inc_field: 'reference_no',
          });
          schema.pre('save', function (next) {
            // this.created_by = this.$locals.user_id;
            next();
          });
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
  ],
  providers: [TransactionService, IotService, TransactionRepository],
})
export class TransactionModule {}
