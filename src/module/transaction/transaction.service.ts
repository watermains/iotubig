import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Aggregate, Model } from 'mongoose';
import { start } from 'repl';
import {
  Configuration,
  ConfigurationDocument,
} from '../configuration/entities/configuration.schema';
import { Meter, MeterDocument } from '../meter/entities/meter.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  Transaction,
  TransactionDocument,
} from './entities/transaction.schema';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    private readonly repo: TransactionRepository,
  ) {}

  async create(
    user_id: string,
    organization_id: string,
    dto: CreateTransactionDto,
  ) {
    return this.repo.create(user_id, organization_id, dto);
  }

  async findAll(): Promise<unknown[]> {
    return this.repo.findAll();
  }

  async findWhere(
    dev_eui: string,
    offset: number,
    pageSize: number,
  ): Promise<unknown[]> {
    return this.repo.findWhere(dev_eui, offset, pageSize);
  }

  async remove(id: number) {
    return this.repo.remove(id);
  }

  async getTotalAmounts(startDate: Date, endDate?: Date): Promise<unknown> {
    return this.repo.getTotalAmounts(startDate, endDate);
  }

  async generateReports(startDate: Date, endDate: Date) {
    return this.repo.generateReports(startDate, endDate);
  }
}
