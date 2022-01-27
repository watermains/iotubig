import { IsString, IsEmail, IsOptional } from 'class-validator';
import { IsEmailAlreadyExist } from '../../custom-decorators/unique-email.decorator'

export class CreateUserDto {
  @IsString()
  @IsOptional()
  water_meter_id: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  @IsEmailAlreadyExist({
    message: 'Email $value already exists. Choose another email.',
  })
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  role: string;
}
