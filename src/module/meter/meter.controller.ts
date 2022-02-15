import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guard';
import { IotService } from 'src/iot/iot.service';
import {
  DocumentInterceptor,
  DocumentsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { CreateMeterIOTDto } from './dto/create-meter-iot.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { FindMeterDto, MeterDevEUIDto } from './dto/find-meter.dto';
import { UpdateMeterValveDto } from './dto/update-meter-valve.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { MeterService } from './meter.service';

@ApiTags('Meter')
@ApiBearerAuth()
// @Roles(RoleTypes.admin)
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('meter')
export class MeterController {
  constructor(
    private readonly meterService: MeterService,
    private readonly iotService: IotService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  // @Get('dashboard')
  // @UseInterceptors(ResponseInterceptor)
  // dashboard(@Req() request) {
  //   return this.meterService.dashboard(request);
  // }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ResponseInterceptor)
  create(@Body() dto: CreateMeterDto) {
    return this.meterService.create(dto);
  }

  //TODO expose endpoint only for 1 specific user
  @Post('/iot')
  @ApiBody({
    type: CreateMeterIOTDto,
  })
  @UseInterceptors(ResponseInterceptor, DocumentInterceptor)
  createIoT(@Body() dto: CreateMeterIOTDto) {
    return this.meterService.createIoT(dto);
  }

  @Post('/valve')
  @UseInterceptors(ResponseInterceptor)
  changeValve(@Body() dto: UpdateMeterValveDto) {
    // return this.iotService.sendOpenValveUpdate(dto).pipe(
    //   map(async (obs) => {
    //     console.log(obs);
    //TODO If OBS says a valid transaction occured, proceed with creating the record
    return this.meterService.updateValve(dto);
    //   }),
    // );
  }

  @Get()
  @UseInterceptors(ResponseInterceptor, DocumentsInterceptor)
  findAll() {
    return this.meterService.findAll();
  }

  @Get('/details')
  @Roles(RoleTypes.customer)
  @UseInterceptors(ResponseInterceptor, DocumentInterceptor)
  findOne(@Query() dto: FindMeterDto) {
    return this.meterService.findOne(dto.meterName, dto.devEUI);
  }

  @Get('/stats')
  @UseInterceptors(ResponseInterceptor)
  findStat() {
    return this.meterService.findStats();
  }

  @Patch(':devEUI')
  @UseInterceptors(ResponseInterceptor)
  update(@Param() devEuiDto: MeterDevEUIDto, @Body() dto: UpdateMeterDto) {
    return this.meterService.update(devEuiDto.devEUI, dto);
  }

  @Delete(':devEUI')
  @UseInterceptors(ResponseInterceptor)
  remove(@Param() devEuiDto: MeterDevEUIDto) {
    return this.meterService.remove(devEuiDto.devEUI);
  }
}
