import { Injectable } from '@nestjs/common';
import { TransactionService } from 'src/module/transaction/transaction.service';

@Injectable()
export class TransactionSeederService {
  constructor(private readonly transactionService: TransactionService) {}
  create() {
    const data = require('./transaction.json');
    return this.transactionService.seed(data);
  }
}
