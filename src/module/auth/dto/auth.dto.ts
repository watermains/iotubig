import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAPIKeyDto {
  @ApiProperty({ type: 'string', required: true })
  @IsString()
  organization_name: string;

  @ApiProperty({ type: 'string', required: true })
  @IsString()
  organization_id: string;
}
