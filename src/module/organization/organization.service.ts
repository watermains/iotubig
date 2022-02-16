import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from './organization.repository';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  findAll() {
    return this.organizationRepository.findAll();
  }
}
