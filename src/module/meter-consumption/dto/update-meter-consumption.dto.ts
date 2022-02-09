import { PartialType } from '@nestjs/mapped-types';
import { CreateMeterConsumptionDto } from './create-meter-consumption.dto';

export class UpdateMeterConsumptionDto extends PartialType(
  CreateMeterConsumptionDto,
) {}
