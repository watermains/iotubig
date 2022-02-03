import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from './entities/organization.schema';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationRepository } from './organization.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository]
})
export class OrganizationModule {}
