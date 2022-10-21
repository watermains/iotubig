import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { UserRepository } from '../user/user.repository';
import { VerifyUserDto } from './dto/verify-user-dto';

@Injectable()
export class VerifyUsersService {
  constructor(
    private readonly userRepository: UserRepository,
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
    return this.userRepository.verifyUser(organizationId, dto);
  }

  async deactivateUser(organizationId: ObjectId, dto: VerifyUserDto) {
    return this.userRepository.deactivateUser(organizationId, dto);
  }
}
