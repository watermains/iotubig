import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDecimal, IsPositive } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ type: 'number' })
  @IsPositive()
  amount: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  volume: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  rate: number;

  @ApiProperty({ type: 'string' })
  @IsString()
  iot_meter_id: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  dev_eui: string;
}
