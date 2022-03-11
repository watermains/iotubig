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
import { map } from 'rxjs';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { IotService } from 'src/iot/iot.service';
import {
  DocumentInterceptor,
  MutableDocumentInterceptor,
  ReportsInterceptor,
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
  constructor(
    private readonly meterService: MeterService,
    private readonly iotService: IotService,
  ) {}

  @Post()
  @UseInterceptors(ResponseInterceptor)
  create(@Body() dto: CreateMeterDto) {
    return this.meterService.create(dto);
  }

  @Post('/valve')
  @UseInterceptors(ResponseInterceptor)
  async changeValve(@Req() req, @Body() dto: UpdateMeterValveDto) {
    const meter = await this.meterService.findMeterDetails(
      req.user.id,
      req.user.org_id,
      undefined,
      dto.dev_eui,
    );
    return this.iotService
      .sendOpenValveUpdate(meter.document.wireless_device_id, dto)
      .pipe(
        map(async (obs) => {
          console.log(obs);
          // TODO If OBS says a valid transaction occured, proceed with creating the record
          return this.meterService.updateValve(dto);
        }),
      );
  }

  @Get()
  @UseInterceptors(ResponseInterceptor)
  findAll(@Req() req, @Query() dto: GetMetersDto) {
    return this.meterService.findAll(
      req.user.org_id,
      dto.offset,
      dto.pageSize,
      dto.valve_status,
      dto.consumer_type,
      dto.search,
    );
  }

  @Get('/details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleTypes.customer)
  @UseInterceptors(ResponseInterceptor, MutableDocumentInterceptor)
  findOne(@Req() req, @Query() dto: FindMeterDto) {
    return this.meterService.findMeterDetails(
      req.user.id,
      req.user.org_id,
      dto.meterName,
      dto.devEUI,
    );
  }

  @Get('/stats')
  @UseInterceptors(ResponseInterceptor)
  findStat() {
    return this.meterService.findStats();
  }

  @Get('/reports')
  @UseInterceptors(ReportsInterceptor)
  generateReports(@Req() req) {
    return this.meterService.generateReports(req.user.org_id);
  }

  @Patch(':devEUI')
  @UseInterceptors(ResponseInterceptor)
  update(@Param() devEuiDto: MeterDevEUIDto, @Body() dto: UpdateMeterDto) {
    return this.meterService.updateMeter(devEuiDto.devEUI, dto);
  }

  @Delete(':devEUI')
  @UseInterceptors(ResponseInterceptor)
  remove(@Param() devEuiDto: MeterDevEUIDto) {
    return this.meterService.removeMeter(devEuiDto.devEUI);
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
