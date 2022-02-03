import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from 'src/organization/organization.repository';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class OrganizationSeederService {
  constructor (private readonly organizationRepository: OrganizationRepository) {}
  create() {
    const data = require('./organization.json');
    return this.organizationRepository.seedOrganization(data);
  }
}
