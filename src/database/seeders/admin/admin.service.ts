import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/module/user/user.repository';

@Injectable()
export class AdminSeederService {
  constructor(private readonly userRepository: UserRepository) {}
  create(organization) {
    const admins = require('./admin.json');
    const data = [];
    admins.forEach((admin) => {
      // if (
      //   admin.role == 'super_admin' 
      // ) {
        admin.organization_id = organization._id;
      // }
      data.push(admin);
    });
    const res = Array<Promise<unknown>>();
    // Promise.resolve(this.userRepository.seedAdmin(data))
    res.push(...this.userRepository.seedAdmin(data));
    return res;
  }
}
