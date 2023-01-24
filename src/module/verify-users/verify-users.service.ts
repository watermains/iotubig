import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { lastValueFrom, map } from 'rxjs';
import { MeterRepository } from '../meter/meter.repository';
import { UserRepository } from '../user/user.repository';
import { VerifyUserDto } from './dto/verify-user-dto';
import { IotService } from 'src/iot/iot.service';

@Injectable()
export class VerifyUsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly meterRepository: MeterRepository,
    private readonly iotService: IotService,
  ) {}

  async findAllUnverified(iot_organization_id: ObjectId) {
    const unverifiedUsers = await this.userRepository.findUnverifiedUsers(
      iot_organization_id,
    );
    return {
      response: {
        unverifiedUsers,
      },
    };
  }

  async verifyUser(organizationId: ObjectId, dto: VerifyUserDto) {

    await this.userRepository.verifyUser(organizationId, dto);
    const _meter = await this.meterRepository.findMeter({
      iot_organization_id: organizationId,
      meter_name: dto.water_meter_id,
    });
    return lastValueFrom(
      this.iotService
        .sendDefaultMeter(
          _meter.wireless_device_id,
          dto.water_meter_id,
          _meter.site_name,
        )
        .pipe(
          map(async (obs) => {
            const { meter_name, site_name, unit_name, consumer_type } = _meter;
            const response = await this.meterRepository.updateMeter(
              _meter.dev_eui,
              {
                meter_name,
                allowed_flow: 0,
                site_name,
                unit_name,
                consumer_type,
              },
            );

            if (response === undefined) {
              throw new InternalServerErrorException(
                'Meter reset failed. Contact your administrator.',
              );
            }
            return {
              response,
              message: 'Meter reset successfully',
            };
          }),
        ),
    );
  }

  async deactivateUser(organizationId: ObjectId, dto: VerifyUserDto) {
    return this.userRepository.deactivateUser(organizationId, dto);
  }
}
