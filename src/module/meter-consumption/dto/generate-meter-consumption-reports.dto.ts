import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class GenerateMeterConsumptionReportsDto {
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
}
