import { IsString, IsDecimal, IsPositive } from 'class-validator';

export class CreateTransactionDto {
  @IsPositive()
  amount: number;

  @IsDecimal()
  volume: number;

  @IsDecimal()
  rate: number;

  @IsString()
  iot_meter_id: string;
}
