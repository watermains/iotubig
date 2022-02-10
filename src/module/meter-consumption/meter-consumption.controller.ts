import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { MeterConsumptionService } from './meter-consumption.service';
import { CreateMeterConsumptionDto } from './dto/create-meter-consumption.dto';
import { FilterDateDto } from './dto/filter-meter-consumption.dto';
import { JwtAuthGuard } from 'src/guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';

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
  create(@Body() createMeterConsumptionDto: CreateMeterConsumptionDto) {
    return this.meterConsumptionService.create(createMeterConsumptionDto);
  }

  @Get(':devEUI')
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
