import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetOrganizationsDto {
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

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
