import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from 'src/module/organization/organization.repository';
import { string } from 'yargs';

@Injectable()
export class OrganizationSeederService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}
  create() {
    const data = require('./organization.json');
    data.forEach((obj: { name: string; property: string }) => {
      this.organizationRepository.seedOrganization(obj);
    });
  }
}
