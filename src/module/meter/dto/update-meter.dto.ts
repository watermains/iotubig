import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsOptional } from 'class-validator';
import { MeterDto } from './create-meter.dto';

export class UpdateMeterDto extends PartialType(MeterDto) {
  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  @IsOptional()
  allowed_flow: number;
}
