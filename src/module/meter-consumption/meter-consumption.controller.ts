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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guard';
import {
  DocumentsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { CreateMeterConsumptionDto } from './dto/create-meter-consumption.dto';
import { FilterDateDto } from './dto/filter-meter-consumption.dto';
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

  @Post()
  create(@Req() req, @Body() dto: CreateMeterConsumptionDto) {
    return this.meterConsumptionService.create(req.user.org_id, dto);
  }

  @Get(':devEUI')
  @UseInterceptors(ResponseInterceptor, DocumentsInterceptor)
  findMeterConsumption(
    @Param('devEUI') devEUI: string,
    @Query(new ValidationPipe({ transform: true })) dto: FilterDateDto,
  ) {
    return this.meterConsumptionService.findMeterConsumption(
      devEUI,
      dto.startDate,
      dto.endDate,
    );
  }
}
