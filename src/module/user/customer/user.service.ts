import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { MeterRepository } from 'src/module/meter/meter.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly meterRepository: MeterRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<unknown> {
    const meter = await this.meterRepository.findMeter({
      meter_name: createUserDto.water_meter_id,
    });

    if (!meter.iot_organization_id) {
      throw new BadRequestException('No organization found for meter');
    }

    createUserDto.organization_id = meter.iot_organization_id.toString();
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    return this.userRepository.create(createUserDto);
  }

  async login(loginUserDto: LoginUserDto): Promise<unknown> {
    return this.userRepository.login(loginUserDto);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<unknown> {
    return this.userRepository.forgotPassword(forgotPasswordDto);
  }

  async resetPassword(
    request,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<unknown> {
    return this.userRepository.resetPassword(request, resetPasswordDto);
  }

  async updateAccount(request, updateUserDto: UpdateUserDto): Promise<unknown> {
    return this.userRepository.updateAccount(request, updateUserDto);
  }
}
