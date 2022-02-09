import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsNumber, IsOptional } from 'class-validator';
import { CreateMeterDto } from './create-meter.dto';

export class UpdateMeterDto extends PartialType(CreateMeterDto) {
  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  @IsOptional()
  allowed_flow: number;
}
