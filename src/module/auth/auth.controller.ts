import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { ResponseInterceptor } from 'src/response.interceptor';
import { AuthService } from './auth.service';
import { CreateAPIKeyDto } from './dto/auth.dto';

@ApiTags('Key')
@ApiBearerAuth()
@Roles(RoleTypes.admin)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('key')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post()
  @UseInterceptors(ResponseInterceptor)
  generate(@Body() dto: CreateAPIKeyDto) {
    return this.authService.generateKey(dto);
  }
}
