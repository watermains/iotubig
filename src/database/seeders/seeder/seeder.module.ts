import { Logger, Module } from '@nestjs/common';
import { MongoDBProviderModule } from '../../providers/provider/provider.module';
import { AdminSeederModule } from '../admin/admin.module';
import { ConfigurationSeederModule } from '../configuration/configuration.module';
import { OrganizationSeederModule } from '../organization/organization.module';
import { Seeder } from './seeder';

@Module({
    imports: [MongoDBProviderModule, AdminSeederModule, OrganizationSeederModule, ConfigurationSeederModule],
    providers: [Logger, Seeder]
})
export class SeederModule {}
