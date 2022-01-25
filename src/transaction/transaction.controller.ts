import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { BalanceUpdateDTO, IotService } from 'src/iot/iot.service';
import { map } from 'rxjs/operators';
import { ResponseInterceptor } from 'src/response.interceptor';
import { ResponseWrapper } from 'src/wrapper/response.wrapper';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly iotService: IotService,
  ) {}

  @Post()
  @UseInterceptors(ResponseInterceptor)
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.iotService
      .sendBalanceUpdate(
        new BalanceUpdateDTO(createTransactionDto.amount.toString()),
      )
      .pipe(
        map((obs) => {
          // if OBS says a valid transaction occured, proceed with creating the record
          return this.transactionService
            .create(createTransactionDto)
            .then((value) => {
              console.log(value);
              return value;
            });
        }),
      );
  }

  @Get()
  @UseInterceptors(ResponseInterceptor)
  findAll() {
    return new ResponseWrapper().wrap(this.transactionService.findAll());
  }

  @Get(':meter')
  @UseInterceptors(ResponseInterceptor)
  findWhere(@Param('meter') meter: string) {
    return new ResponseWrapper().wrap(this.transactionService.findWhere(meter));
  }

  @Delete(':id')
  @UseInterceptors(ResponseInterceptor)
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }
}
