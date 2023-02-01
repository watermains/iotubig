import { Controller, UseGuards, UseInterceptors, Get, Req, Body, Query, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { VerifyUsersService } from './verify-users.service';
import {
    ResponseInterceptor,
  } from 'src/response.interceptor';
import { GetUnverifiedUsersDto } from './dto/get-unverified-users.dto';
import { VerifyUserDto } from './dto/verify-user-dto';
import { ObjectId } from 'mongodb';

@ApiTags('verify-users')
@ApiBearerAuth()
@Roles(RoleTypes.admin, RoleTypes.buildingManager)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('verify-users')
export class VerifyUsersController {
    constructor(private readonly verifyUsersService: VerifyUsersService) {}

    @Get()
    @UseInterceptors(ResponseInterceptor)
    async findAllUnverified(@Req() req) {
        const organizationId = new ObjectId(req.user.org_id);
        return this.verifyUsersService.findAllUnverified(organizationId)
    }

    @Post()
    @UseInterceptors(ResponseInterceptor)
    async verifyUser(@Req() req, @Body() body: VerifyUserDto) {
        const organizationId = new ObjectId(req.user.org_id);
        return this.verifyUsersService.verifyUser(organizationId, body)
    }

    @Post('/deactivate')
    @UseInterceptors(ResponseInterceptor)
    async deactivateUser(@Req() req, @Body() body: VerifyUserDto) {
        const organizationId = new ObjectId(req.user.org_id);
        return this.verifyUsersService.deactivateUser(organizationId, body)
    }
    
}
