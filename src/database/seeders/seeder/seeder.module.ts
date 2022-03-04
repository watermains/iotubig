import { Logger, Module } from '@nestjs/common';
import {
  AdminSeederModule,
  ConfigurationSeederModule,
  MeterConsumptionSeederModule,
  OrganizationSeederModule,
  TransactionSeederModule,
} from '..';
import { MongoDBProviderModule } from '../../providers/provider/provider.module';
import { UserSeederModule } from '../user/user.module';
import { Seeder } from './seeder';

@Module({
  imports: [
    MongoDBProviderModule,
    AdminSeederModule,
    UserSeederModule,
    OrganizationSeederModule,
    ConfigurationSeederModule,
    MeterConsumptionSeederModule,
    TransactionSeederModule,
  ],
  providers: [Logger, Seeder],
})
export class SeederModule {}
