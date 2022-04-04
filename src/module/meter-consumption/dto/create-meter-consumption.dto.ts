import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { CreateMeterIOTDto } from 'src/module/meter/dto/create-meter-iot.dto';

export class CreateMeterConsumptionDto extends CreateMeterIOTDto {
  @ApiProperty({ type: 'string', format: 'date-time' })
  @IsDateString()
  consumed_at: string;

  @ApiProperty({ type: 'boolean' })
  @IsOptional()
  @IsBoolean()
  last_uplink: boolean;
}
