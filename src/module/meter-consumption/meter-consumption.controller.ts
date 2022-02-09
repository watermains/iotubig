import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MeterConsumptionService } from './meter-consumption.service';
import { CreateMeterConsumptionDto } from './dto/create-meter-consumption.dto';
import { UpdateMeterConsumptionDto } from './dto/update-meter-consumption.dto';
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

  @Get()
  findAll() {
    return this.meterConsumptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meterConsumptionService.findOne(+id);
  }
}
