import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { MeterCheck, MeterField } from 'src/validators/meter.validator';

export class MeterDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @MeterCheck(
    { field: MeterField.name, unique: true },
    { message: 'Meter Name already taken' },
  )
  meter_name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  site_name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  unit_name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  consumer_type: string;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  iot_organization_id?: string;
}

export class MeterDevEUIDto {
  @ApiProperty({ type: 'string' })
  @MeterCheck(
    { field: MeterField.devEUI, unique: true },
    { message: 'Meter DevEUI already defined' },
  )
  @IsString()
  dev_eui: string;
}

export class CreateMeterDto extends IntersectionType(
  MeterDevEUIDto,
  MeterDto,
) {}
