import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';
import { GetUnverifiedUsersDto } from './get-unverified-users.dto';

export class VerifyUserDto{

  @ApiProperty({ type: 'string', required: true})
  @IsString()
  @Type(() => String)
  water_meter_id: string;

  @ApiProperty({ type: 'string'})
  @IsString()
  @Type(() => String)
  @IsOptional()
  email: string;
}
