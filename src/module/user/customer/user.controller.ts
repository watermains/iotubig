import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MailerService } from 'src/mailer/mailer.service';
import { ResponseInterceptor } from 'src/response.interceptor';
import { JwtAuthGuard } from '../../../guard/auth/jwt-auth.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('auth/register')
  @UseInterceptors(ResponseInterceptor)
  async register(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Post('auth/login')
  @UseInterceptors(ResponseInterceptor)
  login(@Body() body: LoginUserDto) {
    return this.userService.login(body);
  }

  @Post('auth/forgot-password')
  @UseInterceptors(ResponseInterceptor)
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.userService.forgotPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/reset-password')
  @UseInterceptors(ResponseInterceptor)
  resetPassword(@Req() req, @Body() body: ResetPasswordDto) {
    return this.userService.resetPassword(req, body);
  }
}
