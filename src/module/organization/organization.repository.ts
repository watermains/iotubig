import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Organization,
  OrganizationDocument,
} from './entities/organization.schema';

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<OrganizationDocument>,
  ) {}
  async seedOrganization(body) {
    return this.organizationModel.findOneAndUpdate({ name: body.name }, body, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
}
