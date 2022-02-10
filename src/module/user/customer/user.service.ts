import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../user.repository';
import { LoginUserDto } from '../dto/login-user.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<unknown> {
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
}
