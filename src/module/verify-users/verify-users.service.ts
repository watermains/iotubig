import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { MeterRepository } from '../meter/meter.repository';
import { UserRepository } from '../user/user.repository';
import { VerifyUserDto } from './dto/verify-user-dto';

@Injectable()
export class VerifyUsersService {
  constructor(
    private readonly userRepository: UserRepository, 
    private readonly meterRepository: MeterRepository, 
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
    // needs to send an iot call to trigger allowed_flow refresh
    
    // const _meter = await this.meterRepository.findMeter({iot_organization_id: organizationId, meter_name: dto.water_meter_id });
    // if(!!_meter.dev_eui) {
    //   const {meter_name, site_name, unit_name, consumer_type} = _meter;
    //   await this.meterRepository.updateMeter(_meter.dev_eui, {
    //   meter_name,
    //   allowed_flow: 0,
    //   site_name,
    //   unit_name,
    //   consumer_type
    // })}
    
    return await this.userRepository.verifyUser(organizationId, dto);
  }

  async deactivateUser(organizationId: ObjectId, dto: VerifyUserDto) {
    return this.userRepository.deactivateUser(organizationId, dto);
  }
}
