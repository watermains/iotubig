import { Injectable } from '@nestjs/common';
import { from, lastValueFrom, tap } from 'rxjs';
import { IotService } from 'src/iot/iot.service';
import { MeterService } from '../meter/meter.service';
import { ConfigurationRepository } from './configuration.repository';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
@Injectable()
export class ConfigurationService {
  constructor(
    private readonly configurationRepository: ConfigurationRepository,
    private readonly meterService: MeterService,
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
    return lastValueFrom(
      from(
        (async () => {
          const configuration = await this.configurationRepository.update(
            organization_id,
            updateConfigurationDto,
          );

          return {
            response: configuration,
            message: 'Settings saved successfully',
          };
        })(),
      ).pipe(
        tap({
          complete: async () => {
            const config = await this.configurationRepository.findOne(
              organization_id,
            );
            const meters = await this.meterService.findOrgMeters(
              organization_id,
            );

            meters.forEach((meter) => {
              const rate = config.getConsumptionRate(meter.consumer_type);

              if (updateConfigurationDto.overdraw_limitation) {
                const overDrawVolume =
                  config.overdraw_limitation / meter.getWaterMeterRate(rate);

                lastValueFrom(
                  this.iotService.sendOverdrawUpdate(
                    meter.wireless_device_id,
                    overDrawVolume,
                  ),
                );
              }

              if (updateConfigurationDto.water_alarm_threshold) {
                const lowVolume =
                  config.water_alarm_threshold / meter.getWaterMeterRate(rate);

                lastValueFrom(
                  this.iotService.sendLowBalanceUpdate(
                    meter.wireless_device_id,
                    lowVolume,
                  ),
                );
              }
            });
          },
        }),
      ),
    );
  }
}
