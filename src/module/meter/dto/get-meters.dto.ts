import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetMetersDto {
  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset: number;

  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize: number;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  search: string;
}
