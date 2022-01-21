import { IsEmail } from 'class-validator';
import { IsEmailExist } from '../../custom-decorators/exist-email.decorator' 

export class ForgotPasswordDto {
  @IsEmail()
  @IsEmailExist({
    message: "Email not found"
  })
  email: string;
}
