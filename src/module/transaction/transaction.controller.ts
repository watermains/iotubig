import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { BalanceUpdateDTO, IotService } from 'src/iot/iot.service';
import { map } from 'rxjs/operators';
import {
  DocumentsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MeterService } from 'src/module/meter/meter.service';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleTypes.admin)
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly iotService: IotService,
  ) {}

  @Post()
  @UseInterceptors(ResponseInterceptor)
  async create(@Body() dto: CreateTransactionDto) {
    return this.iotService
      .sendBalanceUpdate(new BalanceUpdateDTO(dto.amount.toString()))
      .pipe(
        map((obs) => {
          //TODO If OBS says a valid transaction occured, proceed with creating the record
          return this.transactionService.create(dto).then((value) => {
            console.log(value);
            return value;
          });
        }),
      );
  }

  @Get()
  @UseInterceptors(ResponseInterceptor, DocumentsInterceptor)
  findAll() {
    return this.transactionService.findAll();
  }

  @Get(':meter')
  @Roles(RoleTypes.customer)
  @UseInterceptors(ResponseInterceptor, DocumentsInterceptor)
  findWhere(@Param('meter') meter: string) {
    return this.transactionService.findWhere(meter);
  }

  @Delete(':id')
  @UseInterceptors(ResponseInterceptor)
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }
}
