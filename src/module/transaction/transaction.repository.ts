import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import * as Mongoose from 'mongoose';
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
    created_by: string,
    userId: string,
    dto: CreateTransactionDto,
    meter: Meter,
    config: Configuration,
  );
  seed(data: []);
  findWhere(
    offset: number,
    pageSize: number,
    organization_id: string,
    dev_eui?: string,
  ): Promise<PaginatedData>;
  remove(id: number);
  getTotalAmounts(
    organization_id: string,
    startDate: Date,
    endDate?: Date,
  ): Promise<unknown>;
  generateReports(
    startDate: Date,
    endDate: Date,
    organization_id: string,
    utcOffset: number,
  );
  generateStatements(
    userId: string,
    reportDate: string,
    organization_id: string,
    utcOffset: number,
  );
  findByDevEui(dev_eui: string);
  updateStatus(reference_no: number, status: string);
}

@Injectable()
export class TransactionRepository implements ITransaction {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}
  async create(
    created_by: string,
    userId: string,
    dto: CreateTransactionDto,
    meter: Meter,
    config: Configuration,
  ) {
    const rate = config.getConsumptionRate(meter.consumer_type);

    const volume = dto.amount / meter.getWaterMeterRate(rate);

    const transaction = await this.transactionModel.create({
      ...dto,
      userId,
      status: 'Pending',
      reference_no: 0,
      iot_meter_id: meter.meter_name,
      volume,
      rate,
      site_name: meter.site_name,
      unit_name: meter.unit_name,
      current_meter_volume: meter.allowed_flow,
      created_by,
    });

    return transaction;
  }

  seed(data: []) {
    data.forEach(async (val) => await this.transactionModel.create(val));
  }

  async findWhere(
    offset: number,
    pageSize: number,
    organization_id: string,
    dev_eui?: string,
  ): Promise<PaginatedData> {
    const $match = {
      'meter.iot_organization_id': new Mongoose.Types.ObjectId(organization_id),
    };

    if (dev_eui) {
      $match['meter.dev_eui'] = dev_eui;
    }

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
      { $match },
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

    const count = await this.transactionModel.aggregate([
      ...transactionsPipeline,
      {
        $count: 'total_rows',
      },
    ]);

    const total_rows = count?.[0]?.total_rows;

    return new PaginatedData(transactions, total_rows);
  }

  async remove(id: number) {
    const forRemove = await this.transactionModel.findOne({ id });
    forRemove.deleted_at = new Date();
    forRemove.save();
    return { message: 'Transaction successfully deleted.' };
  }

  async getTotalAmounts(
    organization_id: string,
    startDate: Date,
    endDate?: Date,
  ): Promise<unknown> {
    const date: { $gte: Date; $lte?: Date } = { $gte: startDate };

    if (endDate) {
      date.$lte = endDate;
    }

    return await this.transactionModel.aggregate([
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
          meter: { $arrayElemAt: ['$meter', 0] },
        },
      },
      {
        $match: {
          date,
          'meter.iot_organization_id': new Mongoose.Types.ObjectId(
            organization_id,
          ),
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

  async generateReports(
    startDate: Date,
    endDate: Date,
    organization_id: string,
    utcOffset: number,
  ) {
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
              date: { $add: ['$createdAt', utcOffset * 60 * 60 * 1000] },
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
          'meter.iot_organization_id': new Mongoose.Types.ObjectId(
            organization_id,
          ),
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
        label: 'Date',
        value: 'date',
      },
      {
        label: 'Time',
        value: 'time',
      },
      {
        label: 'Meter Name',
        value: 'iot_meter_id',
      },
      {
        label: 'Meter Number',
        value: 'dev_eui',
      },
      {
        label: 'Load Amount',
        value: 'amount',
      },
    ];

    const workSheetName = "Remittance Report";
    const sheetHeaderTitle = "General Detailed Report";

    return { data, fields, startDate, endDate, workSheetName, sheetHeaderTitle };
  }

  async getAllAvailableStatements(userId: string) {
    const dateValues = [];
    const allTransactions = await this.transactionModel.find({ userId }, [], {
      sort: { createdAt: -1 },
    });

    allTransactions.map((transaction) => {
      const _date = moment(new Date(transaction.createdAt)).format('MMMM YYYY');
      if (!dateValues.includes(_date)) {
        dateValues.push(_date);
      }
    });

    return { response: { all_statements: dateValues } };
  }

  async generateStatements(
    userId: string,
    reportDate: string,
    organization_id: string,
    utcOffset: number,
  ) {
    const startDate = moment(new Date(reportDate))
      .startOf('month')
      .format('YYYY-MM-DD');
    const endDate = moment(new Date(reportDate))
      .endOf('month')
      .format('YYYY-MM-DD');

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
        $lookup: {
          from: 'users',
          let: { meter_name: '$iot_meter_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$isActive', true] },
                    { $eq: ['$$meter_name', '$water_meter_id'] },
                  ],
                },
              },
            },
          ],
          as: 'users',
        },
      },
      {
        $addFields: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $add: ['$createdAt', utcOffset * 60 * 60 * 1000] },
            },
          },
          volume_cubic_meter: {
            $divide: ['$volume', 1000],
          },
          meter: { $arrayElemAt: ['$meter', 0] },
          email: { $arrayElemAt: ['$users.email', 0] },
        },
      },
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          'meter.iot_organization_id': new Mongoose.Types.ObjectId(
            organization_id,
          ),
          'users.isActive': true,
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
        label: 'Date',
        value: 'date',
      },
      {
        label: 'Time',
        value: 'time',
      },
      {
        label: 'Meter Name',
        value: 'iot_meter_id',
      },
      {
        label: 'Load Amount',
        value: 'amount',
      },
      {
        label: 'Load Balance',
        value: 'current_meter_volume',
      },
      {
        label: 'Water Consumed',
        value: 'cumulative_flow',
      },
    ];

    return { data, fields, startDate, endDate };
  }

  async findByDevEui(dev_eui: string) {
    return await this.transactionModel
      .findOne({ dev_eui })
      .sort({ reference_no: -1 });
  }

  async updateStatus(reference_no: number, status: string) {
    return await this.transactionModel.findOneAndUpdate(
      { reference_no },
      { status },
      { new: true },
    );
  }

  updateMany(filter: object, update: object): any {
    return this.transactionModel.updateMany(filter, update);
  }
}
