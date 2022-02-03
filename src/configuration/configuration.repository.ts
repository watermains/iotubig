import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Configuration,
  ConfigurationDocument,
} from './entities/configuration.schema';

@Injectable()
export class ConfigurationRepository {
  constructor(
    @InjectModel(Configuration.name)
    private configurationModel: Model<ConfigurationDocument>,
  ) {}

  seedConfiguration(body) {
    return this.configurationModel.findOneAndUpdate({organization_id: body.organization_id}, body, { upsert: true, new: true, setDefaultsOnInsert: true })
  }
}
