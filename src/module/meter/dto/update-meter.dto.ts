import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsDecimal, IsOptional } from 'class-validator';
import { MeterDto } from './create-meter.dto';

export class AllowedFlowDto {
  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  @IsOptional()
  allowed_flow: number;
}

export class UpdateMeterDto extends IntersectionType(
  AllowedFlowDto,
  MeterDto,
) {}
