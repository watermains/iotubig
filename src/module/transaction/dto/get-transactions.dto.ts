import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetTransactionsDto {
  @ApiProperty({ type: 'number', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset = 0;

  @ApiProperty({ type: 'number', required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize = 10;
}
