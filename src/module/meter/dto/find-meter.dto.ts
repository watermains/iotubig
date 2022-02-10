import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { MeterDevEUIExist } from 'src/validators/exist-meter.validator';

export class MeterDevEUIDto {
  @ApiProperty({ type: 'string', required: true })
  @IsString()
  @MeterDevEUIExist({ message: 'Meter does not exist' })
  devEUI: string;
}

export class FindMeterDto extends PartialType(MeterDevEUIDto) {
  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  meterName: string;

  @ApiProperty({ type: 'string', required: true })
  @IsString()
  @MeterDevEUIExist()
  devEUI: string;
}
