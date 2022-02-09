import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTransactionDto } from './dto/create-transaction.dto';

import {
  Transaction,
  TransactionDocument,
} from './entities/transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionDocument> {
    return await this.transactionModel.create({
      ...createTransactionDto,
      created_by: '-1',
      reference_no: 0,
    });
  }

  async findAll(): Promise<TransactionDocument[]> {
    return await this.transactionModel
      .find({
        deleted_at: null,
      })
      .sort({ created_at: '-1' });
  }

  async findWhere(meter: string): Promise<TransactionDocument[]> {
    return await this.transactionModel
      .find({
        iot_meter_id: meter,
        deleted_at: null,
      })
      .sort({ created_at: '-1' });
  }

  async remove(id: number) {
    const forRemove = await this.transactionModel.findOne({ id });
    forRemove.deleted_at = new Date();
  }
}
