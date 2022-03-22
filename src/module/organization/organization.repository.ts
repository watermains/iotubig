import { Injectable } from '@nestjs/common';
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

  findAll(offset: number, pageSize: number, search?: string) {
    const query: { name?: RegExp } = {};

    if (search) {
      query.name = new RegExp(search, 'i');
    }

    return this.organizationModel.find(query).skip(offset).limit(pageSize);
  }

  findById(id: string) {
    return this.organizationModel.findById(id);
  }
}
