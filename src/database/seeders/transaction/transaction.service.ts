import { Injectable } from '@nestjs/common';
import { TransactionRepository } from 'src/module/transaction/transaction.repository';

@Injectable()
export class TransactionSeederService {
  constructor(private readonly repo: TransactionRepository) {}
  create() {
    const data = require('./transaction.json');
    return this.repo.seed(data);
  }
}
