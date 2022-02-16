import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meter, MeterDocument } from '../meter/entities/meter.schema';
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
    @InjectModel(Meter.name)
    private meterModel: Model<MeterDocument>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    await this.transactionModel.create({
      ...createTransactionDto,
      created_by: '-1',
      reference_no: 0,
    });
    return { message: 'Transaction successfully recorded.' };
  }

  async findAll(): Promise<TransactionDocument[]> {
    return await this.transactionModel
      .find({
        deleted_at: null,
      })
      .sort({ createdAt: '-1' });
  }

  async findWhere(dev_eui: string): Promise<TransactionDocument[]> {
    const { meter_name: iot_meter_id } = await this.meterModel.findOne({
      dev_eui,
    });

    return await this.transactionModel
      .find({
        iot_meter_id,
        deleted_at: null,
      })
      .sort({ createdAt: '-1' });
  }

  async remove(id: number) {
    const forRemove = await this.transactionModel.findOne({ id });
    forRemove.deleted_at = new Date();
  }
}
