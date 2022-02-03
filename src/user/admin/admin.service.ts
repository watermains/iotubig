import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { LoginUserDto } from '../dto/login-user.dto';
import { UserRepository } from '../user.repository';


@Injectable()
export class AdminService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(loginUserDto: LoginUserDto): Promise<Object> {
    return this.userRepository.adminLogin(loginUserDto);
  }
}
