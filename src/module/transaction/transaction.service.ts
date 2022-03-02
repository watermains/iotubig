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
    const meter_name = dto.iot_meter_id;
    const ref = await this.meterModel.findOne({ meter_name });

    const config = await this.configModel.findOne({ organization_id });
    const rate = config.getConsumptionRate(ref.consumer_type);
    const volume = ref.getWaterMeterRate(rate) * dto.amount;

    await this.transactionModel.create({
      ...dto,
      reference_no: 0,
      dev_eui: ref.dev_eui,
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
          deleted_at: null,
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
}
