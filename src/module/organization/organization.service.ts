import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from './organization.repository';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  findAll(offset: number, pageSize: number, search?: string) {
    return this.organizationRepository.findAll(offset, pageSize, search);
  }
}
