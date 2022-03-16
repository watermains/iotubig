import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { ResponseInterceptor } from 'src/response.interceptor';
import { ConfigurationService } from './configuration.service';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@ApiTags('Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleTypes.admin)
@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get()
  @UseInterceptors(ResponseInterceptor)
  findOne(@Req() req) {
    return this.configurationService.findOne(req.user.org_id);
  }

  @Patch()
  @UseInterceptors(ResponseInterceptor)
  async update(@Req() req, @Body() dto: UpdateConfigurationDto) {
    return this.configurationService.update(req.user.org_id, dto);
  }
}
