import {
  Controller,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { DocumentsInterceptor } from 'src/response.interceptor';
import { LogService } from './log.service';

@ApiTags('Log')
@ApiBearerAuth()
@Roles(RoleTypes.admin)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @UseInterceptors(DocumentsInterceptor)
  findAll(@Req() req) {
    return this.logService.findAll(req.user.org_id);
  }
}
