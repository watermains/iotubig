import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MeterStatus } from '../enum/meter.status.enum';

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

  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @IsEnum(MeterStatus)
  @Type(() => Number)
  valve_status: MeterStatus;
}
