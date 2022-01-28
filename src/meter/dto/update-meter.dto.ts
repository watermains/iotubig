import { PartialType } from '@nestjs/mapped-types';
import { IsDecimal, IsNumber } from 'class-validator';
import { CreateMeterDto } from './create-meter.dto';

export class UpdateMeterDto extends PartialType(CreateMeterDto) {
  @IsDecimal()
  allowed_flow: number;
}
