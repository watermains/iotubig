import { Injectable } from '@nestjs/common';
import { ConfigurationRepository } from './configuration.repository';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { Configuration } from './entities/configuration.schema';
@Injectable()
export class ConfigurationService {
  constructor(
    private readonly configurationRepository: ConfigurationRepository,
  ) {}

  async findOne(organization_id: string): Promise<unknown> {
    const configuration = this.configurationRepository.findOne(organization_id);

    return { response: configuration };
  }

  async update(
    organization_id: string,
    updateConfigurationDto: UpdateConfigurationDto,
  ): Promise<unknown> {
    const configuration = this.configurationRepository.update(
      organization_id,
      updateConfigurationDto,
    );

    return { response: configuration, message: 'Settings saved successfully' };
  }
}
