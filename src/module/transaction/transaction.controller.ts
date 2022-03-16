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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import {
  AggregatedDocumentsInterceptor,
  ReportsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GenerateTransactionReportsDto } from './dto/generate-transaction-reports.dto';
import { GetTransactionsTotalAmountsDto } from './dto/get-transactions-total-amounts.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { TransactionService } from './transaction.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleTypes.admin)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseInterceptors(ResponseInterceptor)
  async create(@Req() request: any, @Body() dto: CreateTransactionDto) {
    return this.transactionService.sendBalanceUpdate(
      request.user.id,
      request.user.org_id,
      dto,
    );
  }

  @Get()
  @UseInterceptors(ResponseInterceptor)
  findAll(@Query() dto: GetTransactionsDto) {
    return this.transactionService.findAll(dto.offset, dto.pageSize);
  }

  @Get('/reports')
  @UseInterceptors(ReportsInterceptor)
  generateReports(@Query() dto: GenerateTransactionReportsDto) {
    return this.transactionService.generateReports(dto.startDate, dto.endDate);
  }

  @Post('amounts/total')
  @UseInterceptors(ResponseInterceptor, AggregatedDocumentsInterceptor)
  total(
    @Body()
    dto: GetTransactionsTotalAmountsDto,
  ) {
    return this.transactionService.getTotalAmounts(dto.startDate, dto.endDate);
  }

  @Get(':devEUI')
  @Roles(RoleTypes.customer)
  @UseInterceptors(ResponseInterceptor)
  findWhere(@Param('devEUI') devEUI: string, @Query() dto: GetTransactionsDto) {
    return this.transactionService.findWhere(devEUI, dto.offset, dto.pageSize);
  }

  @Delete(':id')
  @UseInterceptors(ResponseInterceptor)
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }
}
