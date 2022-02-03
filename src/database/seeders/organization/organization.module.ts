import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from 'src/organization/entities/organization.schema';
import { OrganizationRepository } from 'src/organization/organization.repository';
import { OrganizationSeederService } from './organization.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  providers: [OrganizationSeederService, OrganizationRepository],
  exports: [OrganizationSeederService]
})
export class OrganizationSeederModule {}
