import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { IotService } from 'src/iot/iot.service';
import { ResponseInterceptor } from 'src/response.interceptor';
import { MeterService } from '../meter/meter.service';
import { ConfigurationService } from './configuration.service';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@ApiTags('Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleTypes.admin)
@Controller('configuration')
export class ConfigurationController {
  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly meterService: MeterService,
    private readonly iotService: IotService,
  ) {}

  @Get()
  @UseInterceptors(ResponseInterceptor)
  findOne(@Req() req) {
    return this.configurationService.findOne(req.user.org_id);
  }

  @Patch()
  @UseInterceptors(ResponseInterceptor)
  async update(@Req() req, @Body() dto: UpdateConfigurationDto) {
    const meters = await this.meterService.findOrgMeters(req.user.org_id);
    meters.forEach((meter) => {
      lastValueFrom(
        this.iotService.sendOverdrawUpdate(meter.wireless_device_id, dto),
      );
      lastValueFrom(
        this.iotService.sendLowBalanceUpdate(meter.wireless_device_id, dto),
      );
    });
    return this.configurationService.update(req.user.org_id, dto);
  }
}
