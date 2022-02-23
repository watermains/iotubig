import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMeterValveDto {
  @ApiProperty({ type: 'boolean' })
  @IsBoolean()
  is_open: boolean;

  @ApiProperty({ type: 'string' })
  @IsString()
  dev_eui: string;

  @ApiProperty({ type: 'boolean' })
  @IsBoolean()
  @IsOptional()
  force: boolean;
}
