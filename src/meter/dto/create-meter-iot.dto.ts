import { IsDecimal, IsInt, IsString } from 'class-validator';
import { CreateMeterDto } from './create-meter.dto';

export class CreateMeterIOTDto extends CreateMeterDto {
  @IsString()
  wireless_device_id: string;

  @IsDecimal()
  cumulative_flow: number;

  @IsDecimal()
  allowed_flow: number;

  @IsInt()
  battery_level: number;

  @IsInt()
  battery_fault: number;

  @IsInt()
  valve_status: number;

  @IsInt()
  valve_fault: number;

  @IsInt()
  hall_fault: number;

  @IsInt()
  mag_fault: number;

  @IsInt()
  frame_id: number;
}
