import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ResponseInterceptor } from 'src/response.interceptor';
import { LoginUserDto } from '../dto/login-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/login')
  @UseInterceptors(ResponseInterceptor)
  login(@Body() body: LoginUserDto) {
    return this.adminService.login(body);
  }
}
