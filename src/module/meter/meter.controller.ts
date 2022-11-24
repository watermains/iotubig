import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import {
  CsvReportsInterceptor,
  DocumentInterceptor,
  MutableDocumentInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { CreateMeterIOTDto } from './dto/create-meter-iot.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { FindMeterDto, MeterDevEUIDto } from './dto/find-meter.dto';
import { GetMetersDto } from './dto/get-meters.dto';
import { UpdateMeterValveDto } from './dto/update-meter-valve.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { MeterService } from './meter.service';

@ApiTags('Meter')
@ApiBearerAuth()
@Roles(RoleTypes.admin)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('meter')
export class MeterController {
  constructor(private readonly meterService: MeterService) {}

  @Post()
  @Roles(RoleTypes.superAdmin)
  @UseInterceptors(ResponseInterceptor)
  create(@Req() req, @Body() dto: CreateMeterDto) {
    return this.meterService.create(dto, req.user.role, req.user.org_id);
  }

  @Post('/valve')
  @Roles(RoleTypes.superAdmin)
  @UseInterceptors(ResponseInterceptor)
  async changeValve(@Req() req, @Body() dto: UpdateMeterValveDto) {
    return this.meterService.changeValve(
      req.user.id,
      req.user.org_id,
      dto,
      req.user.role,
    );
  }

  @Get()
  @Roles(RoleTypes.superAdmin)
  @UseInterceptors(ResponseInterceptor)
  findAll(@Req() req, @Query() dto: GetMetersDto) {
    return this.meterService.findAll(
      req.user.org_id,
      dto.offset,
      dto.pageSize,
      dto.valve_status,
      dto.consumer_type,
      dto.search,
      req.user.role,
      req.user.org_id,
      dto.transactable,
      dto.allowed_flow,
      dto.sortIndex,
      dto.ascending,
    );
  }

  @Get('/details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleTypes.customer, RoleTypes.superAdmin)
  @UseInterceptors(ResponseInterceptor, MutableDocumentInterceptor)
  findOne(@Req() req, @Query() dto: FindMeterDto) {
    return this.meterService.findMeterDetails(
      req.user.id,
      req.user.org_id,
      dto.meterName,
      dto.devEUI,
      req.user.role,
    );
  }

  @Get('/stats')
  @Roles(RoleTypes.superAdmin)
  @UseInterceptors(ResponseInterceptor)
  findStat(@Req() req) {
    return this.meterService.findStats(req.user.role, req.user.org_id);
  }

  @Get('/uplink')
  @Roles(RoleTypes.superAdmin)
  @UseInterceptors(ResponseInterceptor)
  findUplink(@Req() req) {
    return this.meterService.findLatestUplink(req.user.org_id);
  }

  @Get('/reports')
  @UseInterceptors(CsvReportsInterceptor)
  generateReports(@Req() req) {
    return this.meterService.generateReports(req.user.org_id);
  }

  @Patch('/:devEUI')
  @Roles(RoleTypes.superAdmin)
  @UseInterceptors(ResponseInterceptor)
  update(
    @Req() req,
    @Param() devEuiDto: MeterDevEUIDto,
    @Body() dto: UpdateMeterDto,
  ) {
    return this.meterService.updateMeter(devEuiDto.devEUI, dto, req.user.role);
  }

  @Delete('/:devEUI')
  @Roles(RoleTypes.superAdmin)
  @UseInterceptors(ResponseInterceptor)
  unlink(@Param() devEuiDto: MeterDevEUIDto) {
    return this.meterService.unlinkMeter(devEuiDto.devEUI);
  }
}

@ApiTags('Meter')
@Controller('meter')
export class ExternalMeterController {
  constructor(private readonly meterService: MeterService) {}

  @Post('/iot')
  @ApiSecurity('api_key', ['x-api-key'])
  @ApiBody({
    type: CreateMeterIOTDto,
  })
  @UseInterceptors(ResponseInterceptor, DocumentInterceptor)
  createIoT(@Req() req: any, @Body() dto: CreateMeterIOTDto) {
    return this.meterService.createIoT(req.org_id, dto);
  }
}
