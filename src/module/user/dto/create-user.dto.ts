import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';
import { IsEmailAlreadyExist } from 'src/decorators/unique-email.decorator';

export class CreateUserDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  water_meter_id: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  first_name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  last_name: string;

  @ApiProperty({ type: 'string' })
  @IsEmail()
  @IsEmailAlreadyExist({
    message: 'Email $value already exists. Choose another email.',
  })
  email: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  password: string;
}
