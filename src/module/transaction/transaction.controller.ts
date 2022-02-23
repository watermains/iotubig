import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs/operators';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { BalanceUpdateDTO, IotService } from 'src/iot/iot.service';
import {
  AggregatedDocumentsInterceptor,
  DocumentsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionsTotalAmountDto } from './dto/get-transactions-total-amount.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
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
  async create(@Req() request: any, @Body() dto: CreateTransactionDto) {
    return this.iotService
      .sendBalanceUpdate(new BalanceUpdateDTO(dto.amount.toString()))
      .pipe(
        map((obs) => {
          //TODO If OBS says a valid transaction occured, proceed with creating the record
          return this.transactionService
            .create(request.user.id, request.user.org_id, dto)
            .then((value) => {
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

  @Get('amount/total')
  @UseInterceptors(ResponseInterceptor, AggregatedDocumentsInterceptor)
  total(
    @Query(new ValidationPipe({ transform: true }))
    dto: GetTransactionsTotalAmountDto,
  ) {
    return this.transactionService.getTotalAmount(dto.startDate, dto.endDate);
  }

  @Get(':devEUI')
  @Roles(RoleTypes.customer)
  @UseInterceptors(ResponseInterceptor, DocumentsInterceptor)
  findWhere(@Param('devEUI') devEUI: string, @Query() dto: GetTransactionsDto) {
    return this.transactionService.findWhere(devEUI, dto.offset, dto.pageSize);
  }

  @Delete(':id')
  @UseInterceptors(ResponseInterceptor)
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }
}
