import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { MeterDevEUIUnique } from 'src/validators/meter.validator';

export class MeterDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  meter_name: number;

  @ApiProperty({ type: 'string' })
  @IsString()
  site_name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  unit_name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  consumer_type: string;
}

export class MeterDevEUIDto extends PartialType(MeterDto) {
  @ApiProperty({ type: 'string' })
  @MeterDevEUIUnique({ message: 'Meter DevEUI already defined' })
  @IsString()
  dev_eui: string;
}

export class CreateMeterDto extends IntersectionType(
  MeterDevEUIDto,
  MeterDto,
) {}
