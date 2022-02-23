import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsInt, IsString } from 'class-validator';
import { CreateMeterDto } from './create-meter.dto';

export class CreateMeterIOTDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  dev_eui: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  wireless_device_id: string;

  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  cumulative_flow: number;

  @ApiProperty({ type: 'number', format: 'double' })
  @IsDecimal()
  allowed_flow: number;

  @ApiProperty({ type: 'number' })
  @IsInt()
  battery_level: number;

  @ApiProperty({ type: 'number' })
  @IsInt()
  battery_fault: number;

  @ApiProperty({ type: 'number' })
  @IsInt()
  valve_status: number;

  @ApiProperty({ type: 'number' })
  @IsInt()
  valve_fault: number;

  @ApiProperty({ type: 'number' })
  @IsInt()
  hall_fault: number;

  @ApiProperty({ type: 'number' })
  @IsInt()
  mag_fault: number;

  @ApiProperty({ type: 'number' })
  @IsInt()
  frame_id: number;
}
