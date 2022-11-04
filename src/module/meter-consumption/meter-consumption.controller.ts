import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guard';
import {
  DocumentsInterceptor,
  ReportsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { CreateMeterConsumptionDto } from './dto/create-meter-consumption.dto';
import { FilterDateDto } from './dto/filter-meter-consumption.dto';
import { GenerateMeterConsumptionReportsDto } from './dto/generate-meter-consumption-reports.dto';
import { MeterConsumptionService } from './meter-consumption.service';

@ApiTags('Meter Consumption')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(RoleTypes.admin)
@Controller('meter-consumption')
export class MeterConsumptionController {
  constructor(
    private readonly meterConsumptionService: MeterConsumptionService,
  ) {}

  @Get('/reports')
  @UseInterceptors(ReportsInterceptor)
  generateReports(
    @Req() req,
    @Query() dto: GenerateMeterConsumptionReportsDto,
  ) {
    return this.meterConsumptionService.generateReports(
      dto.startDate,
      dto.endDate,
      req.user.org_id,
      dto.utcOffset,
    );
  }

  @Get(':devEUI')
  @UseInterceptors(ResponseInterceptor)
  findMeterConsumption(
    @Req() req,
    @Param('devEUI') devEUI: string,
    @Query(new ValidationPipe({ transform: true })) dto: FilterDateDto,
  ) {
    return this.meterConsumptionService.findMeterConsumption(
      devEUI,
      req.user.id,
      req.user.org_id,
      dto.startDate,
      dto.endDate,
    );
  }
}

@ApiTags('Meter Consumption')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('meter-consumption')
export class ExternalMeterConsumptionController {
  constructor(
    private readonly meterConsumptionService: MeterConsumptionService,
  ) {}
  @Post()
  create(@Req() req, @Body() dto: CreateMeterConsumptionDto) {
    console.log(req.org_id);
    return this.meterConsumptionService.create(req.org_id, dto);
  }
}
