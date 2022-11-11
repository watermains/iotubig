import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import {
  CsvReportsInterceptor,
  DocumentsInterceptor,
  ReportsInterceptor,
} from 'src/response.interceptor';
import { GenerateLogReportsDto } from './dto/generate-log-reports.dto';
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

  @Get('/reports')
  @UseInterceptors(CsvReportsInterceptor)
  generateReports(@Req() req, @Query() dto: GenerateLogReportsDto) {
    return this.logService.generateReports(
      dto.startDate,
      dto.endDate,
      req.user.org_id,
      dto.utcOffset,
    );
  }
}
