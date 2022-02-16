import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { IotService } from 'src/iot/iot.service';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './entities/transaction.schema';
import { HttpModule } from '@nestjs/axios';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { Meter, MeterSchema } from 'src/module/meter/entities/meter.schema';

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
  providers: [TransactionService, IotService],
})
export class TransactionModule {}
