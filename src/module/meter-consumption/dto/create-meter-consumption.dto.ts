import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { CreateMeterIOTDto } from 'src/module/meter/dto/create-meter-iot.dto';

export class CreateMeterConsumptionDto extends CreateMeterIOTDto {
  @ApiProperty({ type: 'string', format: 'date-time' })
  @IsDate()
  consumed_at: string;

  @ApiProperty({ type: 'boolean' })
  @IsOptional()
  is_last: boolean;
}
