import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { MeterCheck, MeterField } from 'src/validators/meter.validator';

export class MeterDevEUIDto {
  @ApiProperty({ type: 'string', required: true })
  @IsString()
  @MeterCheck(
    { field: MeterField.devEUI, exist: true },
    { message: 'Meter does not exist' },
  )
  devEUI: string;
}

export class MeterNameDto {
  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  meterName: string;
}

export class FindMeterDto {
  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  meterName: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  devEUI: string;
}
