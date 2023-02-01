import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class GetOtcPaymentTransactionDto {
  @ApiProperty({ type: 'object' })
  metadata: {
    user_id: string,
    organization_id: string,
    meter_name: string,
    dev_eui: string
  };

  @ApiProperty({ type: 'string' })
  @IsString()
  status: string

  @ApiProperty({ type: 'number'})
  @IsNumber()
  amount: number;

  @ApiProperty({ type: 'string' })
  @IsString()
  currency: string

  @ApiProperty({
    type: 'string',
    format: 'date',
  })
  @IsDateString()
  created: Date;
  
}
