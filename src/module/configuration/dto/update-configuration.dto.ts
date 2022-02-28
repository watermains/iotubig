import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDecimal, IsNegative, IsOptional } from 'class-validator';

export class UpdateConfigurationDto {
  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  @IsOptional()
  water_alarm_threshold?: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @IsNegative()
  @IsOptional()
  @Type(() => Number)
  overdraw_limitation?: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  @IsOptional()
  minimum_monthly_consumer_deduction?: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  @IsOptional()
  residential_consumption_rates?: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  @IsOptional()
  commercial_consumption_rates?: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  @IsOptional()
  battery_level_threshold?: number;
}
