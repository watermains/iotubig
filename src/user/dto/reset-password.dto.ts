import { IsString, IsJWT } from 'class-validator';
import { IsMatch } from '../../custom-decorators/match.decorator';

export class ResetPasswordDto {
  @IsString()
  password: string;

  @IsString()
  @IsMatch('password')
  confirm_password: string;
}
