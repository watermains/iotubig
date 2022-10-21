import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class GetUnverifiedUsersDto {
  @ApiProperty({ type: 'string', required: true})
  @IsString()
  @Type(() => ObjectId)
  organization_id: ObjectId;
}
