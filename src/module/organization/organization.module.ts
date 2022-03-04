import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from './entities/organization.schema';
import { OrganizationRepository } from './organization.repository';
import { JwtStrategy, JwtAuthGuard, RolesGuard } from 'src/guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class OrganizationModule {}
