import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { MeterDevEUIExist } from 'src/validators/meter.validator';

export class MeterDevEUIDto {
  @ApiProperty({ type: 'string', required: true })
  @IsString()
  @MeterDevEUIExist({ message: 'Meter does not exist' })
  devEUI: string;
}

export class MeterNameDto {
  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  meterName: string;
}

export class FindMeterDto extends IntersectionType(
  MeterNameDto,
  MeterDevEUIDto,
) {}
