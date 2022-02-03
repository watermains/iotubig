import { PartialType } from '@nestjs/mapped-types';
import { IsDecimal, IsNumber, IsOptional } from 'class-validator';
import { CreateMeterDto } from './create-meter.dto';

export class UpdateMeterDto extends PartialType(CreateMeterDto) {
  @IsDecimal()
  @IsOptional()
  allowed_flow: number;
}
