import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { ConfigurationRepository } from './configuration.repository';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
@Injectable()
export class ConfigurationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configurationRepository: ConfigurationRepository,
  ) {}

  create(createConfigurationDto: CreateConfigurationDto) {
    return 'This action adds a new configuration';
  }

  findAll() {
    return `This action returns all configuration`;
  }

  async findOne(userId: string): Promise<unknown> {
    const organization_id = await this.userRepository.findOrganizationIdById(
      userId,
    );

    return this.configurationRepository.findOne(organization_id);
  }

  async update(
    userId: string,
    updateConfigurationDto: UpdateConfigurationDto,
  ): Promise<unknown> {
    const organization_id = await this.userRepository.findOrganizationIdById(
      userId,
    );

    return this.configurationRepository.update(
      organization_id,
      updateConfigurationDto,
    );
  }

  remove(id: number) {
    return `This action removes a #${id} configuration`;
  }
}
