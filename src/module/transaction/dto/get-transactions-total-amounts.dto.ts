import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class GetTransactionsTotalAmountsDto {
  @ApiProperty({
    type: 'string',
    format: 'date',
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}
