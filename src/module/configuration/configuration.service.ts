import { Injectable } from '@nestjs/common';
import { ConfigurationRepository } from './configuration.repository';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
@Injectable()
export class ConfigurationService {
  constructor(
    private readonly configurationRepository: ConfigurationRepository,
  ) {}

  async findOne(organization_id: string): Promise<unknown> {
    return this.configurationRepository.findOne(organization_id);
  }

  async update(
    organization_id: string,
    updateConfigurationDto: UpdateConfigurationDto,
  ): Promise<unknown> {
    return this.configurationRepository.update(
      organization_id,
      updateConfigurationDto,
    );
  }
}
