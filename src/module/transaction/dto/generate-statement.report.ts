import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber } from 'class-validator';
import { GenerateTransactionReportsDto } from './generate-transaction-reports.dto';

export class GenerateStatementReportsDto {
  @ApiProperty({
    type: 'string',
  })
  reportDate: string;

  @ApiProperty({
    type: 'number',
  })
  @IsNumber()
  @Type(() => Number)
  utcOffset: number;
}
