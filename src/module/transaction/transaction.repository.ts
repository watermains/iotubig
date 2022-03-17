import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Configuration } from '../configuration/entities/configuration.schema';
import { Meter } from '../meter/entities/meter.schema';
import { PaginatedData } from '../pagination/paginate';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  Transaction,
  TransactionDocument,
} from './entities/transaction.schema';

export interface ITransaction {
  create(
    user_id: string,
    dto: CreateTransactionDto,
    meter: Meter,
    config: Configuration,
  );
  seed(data: []);
  findWhere(
    offset: number,
    pageSize: number,
    dev_eui?: string,
  ): Promise<PaginatedData>;
  remove(id: number);
  getTotalAmounts(startDate: Date, endDate?: Date): Promise<unknown>;
  generateReports(startDate: Date, endDate: Date);
}

@Injectable()
export class TransactionRepository implements ITransaction {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}
  async create(
    user_id: string,
    dto: CreateTransactionDto,
    meter: Meter,
    config: Configuration,
  ) {
    const rate = config.getConsumptionRate(meter.consumer_type);

    const volume = dto.amount / meter.getWaterMeterRate(rate);

    const transaction = await this.transactionModel.create({
      ...dto,
      reference_no: 0,
      iot_meter_id: meter.meter_name,
      volume,
      rate,
      site_name: meter.site_name,
      unit_name: meter.unit_name,
      current_meter_volume: meter.allowed_flow,
      created_by: user_id,
    });

    return transaction;
  }

  seed(data: []) {
    data.forEach(async (val) => await this.transactionModel.create(val));
  }

  async findWhere(
    offset: number,
    pageSize: number,
    dev_eui?: string,
  ): Promise<PaginatedData> {
    const transactionsPipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'meters',
          localField: 'iot_meter_id',
          foreignField: 'meter_name',
          as: 'meter',
        },
      },
      {
        $addFields: {
          meter: { $arrayElemAt: ['$meter', 0] },
        },
      },
      ...(dev_eui
        ? [
            {
              $match: {
                'meter.dev_eui': dev_eui,
              },
            },
          ]
        : []),
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    const transactions = await this.transactionModel.aggregate([
      ...transactionsPipeline,
      {
        $skip: Number(offset),
      },
      {
        $limit: Number(pageSize),
      },
    ]);

    const [{ total_rows }] = await this.transactionModel.aggregate([
      ...transactionsPipeline,
      {
        $count: 'total_rows',
      },
    ]);

    return new PaginatedData(transactions, total_rows);
  }

  async remove(id: number) {
    const forRemove = await this.transactionModel.findOne({ id });
    forRemove.deleted_at = new Date();
    forRemove.save();
    return { message: 'Transaction successfully deleted.' };
  }

  async getTotalAmounts(startDate: Date, endDate?: Date): Promise<unknown> {
    const date: { $gte: Date; $lte?: Date } = { $gte: startDate };

    if (endDate) {
      date.$lte = endDate;
    }

    return await this.transactionModel.aggregate([
      {
        $addFields: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
        },
      },
      {
        $match: {
          date,
        },
      },
      {
        $group: {
          _id: '$date',
          total: {
            $sum: '$amount',
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
  }

  async generateReports(startDate: Date, endDate: Date) {
    const transactions = await this.transactionModel.aggregate([
      {
        $lookup: {
          from: 'meters',
          localField: 'iot_meter_id',
          foreignField: 'meter_name',
          as: 'meter',
        },
      },
      {
        $addFields: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          volume_cubic_meter: {
            $divide: ['$volume', 1000],
          },
          meter: { $arrayElemAt: ['$meter', 0] },
        },
      },
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const data = transactions.map((transaction) => {
      const model = new this.transactionModel(transaction);
      return { ...transaction, ...model.toJSON() };
    });

    const fields = [
      {
        label: 'date',
        value: 'date',
      },
      {
        label: 'meter_name',
        value: 'meter.meter_name',
      },
      {
        label: 'dev_eui',
        value: 'meter.dev_eui',
      },
      {
        label: 'unit_name',
        value: 'meter.unit_name',
      },
      {
        label: 'amount',
        value: 'amount',
      },
      {
        label: 'volume(cu.m)',
        value: 'volume_cubic_meter',
      },
      {
        label: 'rate',
        value: 'rate',
      },
    ];

    return { data, fields };
  }

  updateMany(filter: object, update: object): any {
    return this.transactionModel.updateMany(filter, update);
  }
}
