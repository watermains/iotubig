import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

export class GetTransactionsTotalAmountsDto {
  @ApiProperty({
    type: [Date],
  })
  @IsArray()
  @Type(() => Date)
  dates: Date[];
}
