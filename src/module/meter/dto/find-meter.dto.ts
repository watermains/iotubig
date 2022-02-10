import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindMeterDto {
  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  meterName: string;

  @ApiProperty({ type: 'string', required: true })
  @IsString()
  devEUI: string;
}
