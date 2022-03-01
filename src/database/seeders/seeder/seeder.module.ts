import { Logger, Module } from '@nestjs/common';
import {
  AdminSeederModule,
  ConfigurationSeederModule,
  MeterConsumptionSeederModule,
  OrganizationSeederModule,
  TransactionSeederModule,
} from '..';
import { MongoDBProviderModule } from '../../providers/provider/provider.module';
import { Seeder } from './seeder';

@Module({
  imports: [
    MongoDBProviderModule,
    AdminSeederModule,
    OrganizationSeederModule,
    ConfigurationSeederModule,
    MeterConsumptionSeederModule,
    TransactionSeederModule,
  ],
  providers: [Logger, Seeder],
})
export class SeederModule {}
