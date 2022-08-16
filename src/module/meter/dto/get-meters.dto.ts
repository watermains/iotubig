import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ConsumerType } from '../enum/consumer-type.enum';
import { MeterStatus } from '../enum/meter.status.enum';

export class GetMetersDto {
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

  @ApiProperty({ type: 'number', required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortIndex?: number;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  ascending?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @IsEnum(MeterStatus)
  @Type(() => Number)
  valve_status?: MeterStatus;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsEnum(ConsumerType)
  consumer_type?: ConsumerType;

  @ApiProperty({ type: 'boolean', required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  transactable?: boolean;

  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @Type(() => Number)
  allowed_flow?: number;
}
