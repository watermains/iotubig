import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { IotService } from 'src/iot/iot.service';
import { MailerModule } from 'src/mailer/mailer.module';
import { ConfigurationModule } from '../configuration/configuration.module';
import { MeterModule } from '../meter/meter.module';
import { UserModule } from '../user/user.module';
import { Transaction, TransactionSchema } from './entities/transaction.schema';
import { TransactionController } from './transaction.controller';
import { TransactionRepository } from './transaction.repository';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    ConfigurationModule,
    forwardRef(() => MeterModule),
    UserModule,
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
    MailerModule,
  ],
  controllers: [TransactionController],
  exports: [
    TransactionService,
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
