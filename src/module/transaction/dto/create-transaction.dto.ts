import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDecimal, IsPositive } from 'class-validator';
import { MeterCheck, MeterField } from 'src/validators/meter.validator';

export class CreateTransactionDto {
  @ApiProperty({ type: 'number' })
  @IsPositive()
  amount: number;

  @ApiProperty({ type: 'string' })
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
