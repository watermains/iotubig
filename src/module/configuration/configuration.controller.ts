import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { ResponseInterceptor } from 'src/response.interceptor';
import { ConfigurationService } from './configuration.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@ApiTags('Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleTypes.admin)
@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Post()
  create(@Body() createConfigurationDto: CreateConfigurationDto) {
    return this.configurationService.create(createConfigurationDto);
  }

  @Get()
  @UseInterceptors(ResponseInterceptor)
  findOne(@Req() request: Request) {
    return this.configurationService.findOne(request.user['id']);
  }

  @Patch()
  @UseInterceptors(ResponseInterceptor)
  update(
    @Req() request: Request,
    @Body() updateConfigurationDto: UpdateConfigurationDto,
  ) {
    return this.configurationService.update(
      request.user['id'],
      updateConfigurationDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configurationService.remove(+id);
  }
}
