import { IsString, IsEmail } from 'class-validator';
import { IsEmailExist } from '../../custom-decorators/exist-email.decorator' 

export class LoginUserDto {
  @IsEmail()
  @IsEmailExist({
    message: "Email not found"
  })
  email: string;

  @IsString()
  password: string;
}
