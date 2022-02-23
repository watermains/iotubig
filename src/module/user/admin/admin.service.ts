import { Injectable } from '@nestjs/common';
import { LoginUserDto } from '../dto/login-user.dto';
import { UserRepository } from '../user.repository';

@Injectable()
export class AdminService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(loginUserDto: LoginUserDto): Promise<Object> {
    return this.userRepository.adminLogin(loginUserDto);
  }

  async findOneByEmail(email: string): Promise<Object> {
    const { first_name } = await this.userRepository.findOneByEmail(email);
    return { response: { first_name } };
  }
}
