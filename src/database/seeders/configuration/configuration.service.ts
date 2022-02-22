import { Injectable } from '@nestjs/common';
import { ConfigurationRepository } from 'src/module/configuration/configuration.repository';

@Injectable()
export class ConfigurationSeederService {
  constructor(
    private readonly configurationRepository: ConfigurationRepository,
  ) {}
  seedConfiguration(organization, admin) {
    const data = require('./configuration.json');
    data.organization_id = organization._id;
    data.created_by = admin._id;
    return this.configurationRepository.seedConfiguration(data);
  }
}
