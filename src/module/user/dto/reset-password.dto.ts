import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsJWT } from 'class-validator';
import { IsMatch } from 'src/decorators/match.decorator';

export class ResetPasswordDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  password: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsMatch('password')
  confirm_password: string;
}
