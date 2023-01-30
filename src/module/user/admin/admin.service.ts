import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UserRepository } from '../user.repository';

@Injectable()
export class AdminService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(loginUserDto: LoginUserDto): Promise<unknown> {
    return this.userRepository.adminLogin(loginUserDto);
  }

  async findOneByEmail(email: string): Promise<unknown> {
    const { first_name, role } = await this.userRepository.findOneByEmail(
      email,
    );

    return { response: { first_name, role } };
  }

  async registerAdmin(org_id: string, dto: CreateAdminDto) {
    return await this.userRepository.createAdmin(org_id, dto);
  }
}
