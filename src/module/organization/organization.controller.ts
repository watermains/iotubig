import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import {
  DocumentsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { GetOrganizationsDto } from './dto/get-organizations.dto';
import { OrganizationService } from './organization.service';

@ApiTags('Organization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleTypes.superAdmin)
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
