import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { MeterService } from './meter.service';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import {
  DocumentInterceptor,
  DocumentsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';

@Controller('meter')
export class MeterController {
  constructor(private readonly meterService: MeterService) {}

  @Post()
  @UseInterceptors(ResponseInterceptor, DocumentInterceptor)
  create(@Body() createMeterDto: CreateMeterDto) {
    return this.meterService.create(createMeterDto);
  }

  @Get()
  @UseInterceptors(ResponseInterceptor, DocumentsInterceptor)
  findAll() {
    return this.meterService.findAll();
  }

  @Get('/details')
  @UseInterceptors(ResponseInterceptor, DocumentInterceptor)
  findOne(
    @Query('meterName') meterName: string,
    @Query('devEUI') devEUI: string,
  ) {
    return this.meterService.findOne(meterName, devEUI);
  }

  @Patch(':id')
  @UseInterceptors(ResponseInterceptor, DocumentInterceptor)
  update(@Param('id') id: string, @Body() updateMeterDto: UpdateMeterDto) {
    return this.meterService.update(id, updateMeterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meterService.remove(id);
  }
}
