import { Injectable } from '@nestjs/common';
import { IotService } from 'src/iot/iot.service';
import { MeterRepository } from '../meter/meter.repository';
import { ConfigurationRepository } from './configuration.repository';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
@Injectable()
export class ConfigurationService {
  constructor(
    private readonly configurationRepository: ConfigurationRepository,
    private readonly meterRepo: MeterRepository,
    private readonly iotService: IotService,
  ) {}

  async findOne(organization_id: string): Promise<unknown> {
    const configuration = await this.configurationRepository.findOne(
      organization_id,
    );
    console.log(configuration);
    return { response: configuration };
  }

  async update(
    organization_id: string,
    updateConfigurationDto: UpdateConfigurationDto,
  ): Promise<unknown> {
    
    const configuration = await this.configurationRepository.update(
      organization_id,
      updateConfigurationDto,
    );


    return { response: configuration, message: 'Settings saved successfully' };
  }
}
