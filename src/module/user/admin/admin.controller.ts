import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { ResponseInterceptor } from 'src/response.interceptor';
import { LoginUserDto } from '../dto/login-user.dto';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/login')
  @UseInterceptors(ResponseInterceptor)
  login(@Body() body: LoginUserDto) {
    return this.adminService.login(body);
  }

  @Post('auth/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleTypes.admin)
  @UseInterceptors(ResponseInterceptor)
  me(@Req() req) {
    return this.adminService.findOneByEmail(req.user.email);
  }
}
