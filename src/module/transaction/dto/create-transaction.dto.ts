import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { MeterCheck, MeterField } from 'src/validators/meter.validator';

export class CreateTransactionDto {
  @ApiProperty({ type: 'number' })
  @IsPositive()
  @Min(300)
  amount: number;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  iot_meter_id: string;

  @ApiProperty({ type: 'string' })
  @MeterCheck(
    { field: MeterField.devEUI, exist: true },
    { message: 'Meter does not exist' },
  )
  @IsString()
  dev_eui: string;
}
