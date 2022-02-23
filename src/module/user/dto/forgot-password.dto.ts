import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { IsEmailExist } from 'src/decorators/exist-email.decorator';

export class ForgotPasswordDto {
  @ApiProperty({ type: 'string' })
  @IsEmail()
  @IsEmailExist({
    message: 'Email not found',
  })
  email: string;
}
