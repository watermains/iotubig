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
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles, RoleTypes } from 'src/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import {
  AggregatedDocumentsInterceptor,
  CsvReportsInterceptor,
  ReportsInterceptor,
  ResponseInterceptor,
} from 'src/response.interceptor';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GenerateStatementReportsDto } from './dto/generate-statement.report';
import { GenerateTransactionReportsDto } from './dto/generate-transaction-reports.dto';
import { GetTransactionsTotalAmountsDto } from './dto/get-transactions-total-amounts.dto';
import { GetPaymentTransactionDto } from './dto/get_payment_transaction.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { TransactionService } from './transaction.service';
import { CreatePaymentTransactionDto } from './dto/create-payment-transaction.dto';

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
  findAll(@Req() req, @Query() dto: GetTransactionsDto) {
    return this.transactionService.findAll(
      dto.offset,
      dto.pageSize,
      req.user.org_id,
    );
  }

  @Get('/reports')
  @UseInterceptors(CsvReportsInterceptor)
  generateReports(@Req() req, @Query() dto: GenerateTransactionReportsDto) {
    return this.transactionService.generateReports(
      dto.startDate,
      dto.endDate,
      req.user.org_id,
      dto.utcOffset,
    );
  }

  @Get('/allstatements')
  @UseInterceptors(ResponseInterceptor)
  @Roles(RoleTypes.customer)
  getAllAvailableStatements(@Req() req) {
    return this.transactionService.getAllAvailableStatements(req.user.id);
  }

  @Get('/statements')
  @UseInterceptors(ReportsInterceptor)
  @Roles(RoleTypes.customer)
  generateStatements(@Req() req, @Query() dto: GenerateStatementReportsDto) {
    return this.transactionService.generateStatements(
      req.user.id,
      dto.reportDate,
      req.user.org_id,
      dto.utcOffset,
    );
  }

  @Post('/reload')
  @UseInterceptors(ResponseInterceptor)
  @Roles(RoleTypes.customer)
  reloadMeter(@Req() req, @Body() dto: CreatePaymentTransactionDto) {
    return this.transactionService.reloadMeter(
      req.user.id,
      req.user.org_id,
      dto
    );
  }

  @Post('amounts/total')
  @UseInterceptors(ResponseInterceptor, AggregatedDocumentsInterceptor)
  total(
    @Req() req,
    @Body()
    dto: GetTransactionsTotalAmountsDto,
  ) {
    return this.transactionService.getTotalAmounts(
      req.user.org_id,
      dto.startDate,
      dto.endDate,
    );
  }

  @Get(':devEUI')
  @Roles(RoleTypes.customer)
  @UseInterceptors(ResponseInterceptor)
  findWhere(
    @Req() req,
    @Param('devEUI') devEUI: string,
    @Query() dto: GetTransactionsDto,
  ) {
    return this.transactionService.findWhere(
      devEUI,
      dto.offset,
      dto.pageSize,
      req.user.org_id,
    );
  }

  @Delete(':id')
  @UseInterceptors(ResponseInterceptor)
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }
}

@ApiTags('Transactions')
@ApiSecurity('callback_token', ['x-callback-token'])
@Controller('transactions')
export class ExternalTransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('payment/ewallet')
  create(@Body() body: { data: GetPaymentTransactionDto }) {
    if(!!body?.data?.metadata?.user_id) {
      return this.transactionService.ewalletPayment(body.data);
    }
    return 'Tested and Saved!';
  }
}
