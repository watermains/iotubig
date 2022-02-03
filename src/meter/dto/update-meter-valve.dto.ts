import { IsBoolean, IsString } from 'class-validator';

export class UpdateMeterValveDto {
  @IsBoolean()
  is_open: boolean;

  @IsString()
  dev_eui: string;
}
