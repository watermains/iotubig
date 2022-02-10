import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { MeterDevEUIExist } from 'src/validators/exist-meter.validator';

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

export class CreateMeterDto extends PartialType(MeterDto) {
  @ApiProperty({ type: 'string' })
  @MeterDevEUIExist({ message: 'Meter does not exist' })
  @IsString()
  dev_eui: string;
}
