import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  DocumentsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { OrganizationService } from './organization.service';

@ApiTags('Organization')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @UseInterceptors(ResponseInterceptor, DocumentsInterceptor)
  findAll() {
    return this.organizationService.findAll();
  }
}
