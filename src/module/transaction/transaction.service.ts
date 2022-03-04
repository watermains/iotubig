import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Aggregate, Model } from 'mongoose';
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

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Meter.name)
    private meterModel: Model<MeterDocument>,
    @InjectModel(Configuration.name)
    private configModel: Model<ConfigurationDocument>,
  ) {}

  async seed(data: []) {
    data.forEach(async (val) => await this.transactionModel.create(val));
  }

  async create(
    user_id: string,
    organization_id: string,
    dto: CreateTransactionDto,
  ) {
    const dev_eui = dto.dev_eui;
    const ref = await this.meterModel.findOne({ dev_eui });

    const config = await this.configModel.findOne({ organization_id });
    const rate = config.getConsumptionRate(ref.consumer_type);
    const volume = dto.amount / ref.getWaterMeterRate(rate);

    await this.transactionModel.create({
      ...dto,
      reference_no: 0, // TODO: Add format
      iot_meter_id: ref.meter_name,
      volume,
      rate,
      site_name: ref.site_name,
      unit_name: ref.unit_name,
      current_meter_volume: ref.allowed_flow,
      created_by: user_id,
    });

    ref.allowed_flow = ref.addFlow(ref.allowed_flow, volume);
    await ref.save();
    return { message: 'Transaction successfully recorded.' };
  }

  async findAll(): Promise<TransactionDocument[]> {
    return await this.transactionModel
      .find({
        deleted_at: null,
      })
      .sort({ createdAt: '-1' });
  }

  async findWhere(
    dev_eui: string,
    offset: number,
    pageSize: number,
  ): Promise<TransactionDocument[]> {
    const { meter_name: iot_meter_id } = await this.meterModel.findOne({
      dev_eui,
    });

    return await this.transactionModel
      .find({
        iot_meter_id,
        deleted_at: null,
      })
      .skip(offset)
      .limit(pageSize)
      .sort({ createdAt: '-1' });
  }

  async remove(id: number) {
    const forRemove = await this.transactionModel.findOne({ id });
    forRemove.deleted_at = new Date();
    forRemove.save();
    return { message: 'Transaction successfully deleted.' };
  }

  async getTotalAmounts(
    startDate: Date,
    endDate?: Date,
  ): Promise<Aggregate<TransactionDocument[]>> {
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
    const data = await this.transactionModel.aggregate([
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
          rate: {
            $toString: '$rate',
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
}
