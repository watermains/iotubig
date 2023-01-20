import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsDecimal, IsOptional, IsString } from 'class-validator';
import { MeterCheck, MeterField } from 'src/validators/meter.validator';
import { MeterDto } from './create-meter.dto';

export class AllowedFlowDto {
  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  @IsOptional()
  allowed_flow: number;
}

export class UpdateMeterDto extends IntersectionType(AllowedFlowDto, MeterDto) {
  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  @MeterCheck(
    { field: MeterField.name, unique: true },
    { message: 'Meter Name already taken' },
  )
  meter_name: string;
}
