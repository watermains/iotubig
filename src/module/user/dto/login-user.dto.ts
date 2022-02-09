import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';
import { IsEmailExist } from 'src/decorators/exist-email.decorator';

export class LoginUserDto {
  @ApiProperty({ type: 'string' })
  @IsEmail()
  @IsEmailExist({
    message: 'Email not found',
  })
  email: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  password: string;
}
