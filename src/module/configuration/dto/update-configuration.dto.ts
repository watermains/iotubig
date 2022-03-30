import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNegative, IsOptional, Min } from 'class-validator';

export class UpdateConfigurationDto {
  @ApiProperty({ type: 'number', format: 'double' })
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  water_alarm_threshold?: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @IsNegative()
  @IsOptional()
  @Type(() => Number)
  overdraw_limitation?: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minimum_monthly_consumer_deduction?: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  residential_consumption_rates?: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  commercial_consumption_rates?: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  battery_level_threshold?: number;
}
