import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumberString, IsString } from 'class-validator';

export class CreatePaymentTransactionDto {

  @ApiProperty({ type: 'string' })
  @IsString()
  amount: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  payment_channel: string

}
