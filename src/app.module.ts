import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { MeterModule } from './meter/meter.module';
import { TransactionModule } from './transaction/transaction.module';
import { MongoDBProviderModule } from './database/providers/provider/provider.module';
import { SeederModule } from './database/seeders/seeder/seeder.module';
import { AdminSeederModule } from './database/seeders/admin/admin.module';
import { OrganizationModule } from './organization/organization.module';
import { OrganizationSeederModule } from './database/seeders/organization/organization.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { ConfigurationSeederModule } from './database/seeders/configuration/configuration.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongoDBProviderModule,
    UserModule,
    TransactionModule,
    MeterModule,
    AdminSeederModule,
    SeederModule,
    OrganizationModule,
    OrganizationSeederModule,
    ConfigurationModule,
    ConfigurationSeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
