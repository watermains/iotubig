import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from 'src/module/organization/organization.repository';

@Injectable()
export class OrganizationSeederService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}
  create() {
    const data = require('./organization.json');
    return this.organizationRepository.seedOrganization(data);
  }
}
