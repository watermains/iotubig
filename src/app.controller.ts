import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AppService } from './app.service';


class ConfirmationTokenDto {
  @ApiProperty()
  confirmationToken: string;
}
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private readonly logger = new Logger(AppController.name);

  @Get()
  alive(): string {
    return this.appService.alive();
  }

  @Post('/confirmation')
  confirmation(@Query() dto: ConfirmationTokenDto) {
    this.logger.debug(`AWS TOKEN: ${dto.confirmationToken}`);
  }
}
