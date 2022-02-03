import { IsString } from 'class-validator';

export class CreateMeterDto {
  @IsString()
  meter_name: number;

  @IsString()
  dev_eui: number;

  @IsString()
  site_name: number;

  @IsString()
  unit_name: number;

  @IsString()
  consumer_type: string;
}
