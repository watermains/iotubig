import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/module/user/user.repository';
import { CreateUserDto } from 'src/module/user/dto/create-user.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as faker from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserSeederService {
  constructor(private readonly userRepository: UserRepository) {}
  async create(organization) {
    const meters = Array<any>();
    meters.push(
      ...JSON.parse(
        fs
          .readFileSync(
            path.resolve('src/database/seeders/consumption', 'meters.json'),
          )
          .toString(),
      ),
    );
    const password = await bcrypt.hash(`Ump1sa@123`, 10);
    const data = Array<CreateUserDto>();
    meters.forEach((meter) => {
      if (meter.meter_name.includes('NO USER')) {
        return;
      }
      const first_name = faker.faker.name.firstName();
      const last_name = faker.faker.name.lastName();
      data.push({
        first_name,
        last_name,
        email: faker.faker.internet.email(first_name, last_name, 'umpisa.co'),
        password,
        organization_id: organization._id,
        water_meter_id: meter.meter_name
      });
    });

    return await this.userRepository.seedUser(data);
  }
}
