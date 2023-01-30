import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { IsEmailAlreadyExist } from 'src/decorators/unique-email.decorator';

export class CreateAdminDto {

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
  @IsOptional()
  phone: string;

  @ApiProperty({ type: 'string', required: false, })
  @IsString()
  password: string;

  @ApiProperty({ type: 'boolean', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDeactivated: boolean;
}
