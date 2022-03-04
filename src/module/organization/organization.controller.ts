import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  DocumentsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { GetOrganizationsDto } from './dto/get-organizations.dto';
import { OrganizationService } from './organization.service';

@ApiTags('Organization')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @UseInterceptors(ResponseInterceptor, DocumentsInterceptor)
  findAll(@Query() dto: GetOrganizationsDto) {
    return this.organizationService.findAll(
      dto.offset,
      dto.pageSize,
      dto.search,
    );
  }
}
