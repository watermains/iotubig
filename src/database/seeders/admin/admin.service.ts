import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class AdminSeederService {
  constructor(private readonly userRepository: UserRepository,
    ) {}
  create(organization) {
    var data = require('./admin.json')
    data.organization_id = organization._id
    return this.userRepository.seedAdmin(data);
  }
}
