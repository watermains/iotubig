import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';
import { MeterService } from './meter.service';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import {
  DocumentInterceptor,
  DocumentsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { CreateMeterIOTDto } from './dto/create-meter-iot.dto';
import { UpdateMeterValveDto } from './dto/update-meter-valve.dto';
import { IotService } from 'src/iot/iot.service';
import { map } from 'rxjs/operators';

@Controller('meter')
export class MeterController {
  constructor(
    private readonly meterService: MeterService,
    private readonly iotService: IotService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  // @Get('dashboard')
  // @UseInterceptors(ResponseInterceptor)
  // dashboard(@Req() request) {
  //   return this.meterService.dashboard(request);
  // }

  @Post()
  @UseInterceptors(ResponseInterceptor, DocumentInterceptor)
  create(@Body() dto: CreateMeterDto) {
    return this.meterService.create(dto);
  }

  //TODO expose endpoint only for 1 specific user
  @Post('/iot')
  @UseInterceptors(ResponseInterceptor, DocumentInterceptor)
  createIoT(@Body() dto: CreateMeterIOTDto) {
    return this.meterService.create(dto);
  }

  @Patch('/valve')
  @UseInterceptors(ResponseInterceptor, DocumentInterceptor)
  changeValve(@Body() dto: UpdateMeterValveDto) {
    return this.iotService.sendOpenValveUpdate(dto).pipe(
      map((obs) => {
        //TODO If OBS says a valid transaction occured, proceed with creating the record
        return this.meterService.updateValve(dto);
      }),
    );
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
  update(@Param('id') devEui: string, @Body() dto: UpdateMeterDto) {
    return this.meterService.update(devEui, dto);
  }

  @Delete(':id')
  remove(@Param('id') devEui: string) {
    return this.meterService.remove(devEui);
  }
}
