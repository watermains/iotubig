import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMeterDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  meter_name: number;

  @ApiProperty({ type: 'string' })
  @IsString()
  dev_eui: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  site_name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  unit_name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  consumer_type: string;
}
