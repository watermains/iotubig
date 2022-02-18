import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
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
    return this.configurationModel.findOneAndUpdate(
      { organization_id: body.organization_id },
      body,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async findOne(organization_id: string) {
    const configuration = await this.configurationModel.findOne({
      organization_id,
    });

    return { response: configuration };
  }

  async update(organization_id: string, dto: UpdateConfigurationDto) {
    const configuration = await this.configurationModel.findOneAndUpdate(
      { organization_id },
      { ...dto },
      { upsert: false, new: true },
    );

    return { response: configuration, message: 'Settings saved successfully' };
  }
}
