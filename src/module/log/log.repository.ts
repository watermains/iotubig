import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as Mongoose from 'mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from './entities/log.schema';
import { LogData } from './log.service';
export interface ILog {
  findLogs(organization_id: string);
  createLog(data: LogData);
  generateReports(startDate: Date, endDate: Date, organization_id: string);
}

@Injectable()
export class LogRepository implements ILog {
  constructor(@InjectModel(Log.name) private log: Model<LogDocument>) {}

  async findLogs(organization_id: string) {
    console.log(organization_id);
    return await this.log.find({ organization_id });
  }

  async createLog(data: LogData) {
    return await this.log.create(data);
  }

  async generateReports(
    startDate: Date,
    endDate: Date,
    organization_id: string,
  ) {
    const data = await this.log.aggregate([
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
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          organization_id: new Mongoose.Types.ObjectId(organization_id),
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
        value: 'meter_name',
      },
      {
        label: 'action',
        value: 'action',
      },
      {
        label: 'data',
        value: 'data',
      },
    ];

    return { data, fields };
  }
}
