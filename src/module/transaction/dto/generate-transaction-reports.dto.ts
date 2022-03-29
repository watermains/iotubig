import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber } from 'class-validator';

export class GenerateTransactionReportsDto {
  @ApiProperty({
    type: 'string',
    format: 'date',
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    type: 'string',
    format: 'date',
  })
  @IsDateString()
  endDate: Date;

  @ApiProperty({
    type: 'number',
  })
  @IsNumber()
  @Type(() => Number)
  utcOffset: number;
}
