import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs/operators';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { BalanceUpdateDTO, IotService } from 'src/iot/iot.service';
import {
  DocumentsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionService } from './transaction.service';

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

  @Get(':devEUI')
  @Roles(RoleTypes.customer)
  @UseInterceptors(ResponseInterceptor, DocumentsInterceptor)
  findWhere(@Param('devEUI') devEUI: string) {
    return this.transactionService.findWhere(devEUI);
  }

  @Delete(':id')
  @UseInterceptors(ResponseInterceptor)
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }
}
