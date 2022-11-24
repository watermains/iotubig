import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as Mongoose from 'mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from './entities/log.schema';
import { LogData } from './log.service';
export interface ILog {
  findLogs(organization_id: string);
  createLog(data: LogData);
  generateReports(
    startDate: Date,
    endDate: Date,
    organization_id: string,
    utcOffset: number,
  );
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
    utcOffset: number,
  ) {
    const data = await this.log.aggregate([
      {
        $addFields: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $add: ['$createdAt', utcOffset * 60 * 60 * 1000] },
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
        label: 'Date',
        value: 'date',
      },
      {
        label: 'Meter Name',
        value: 'meter_name',
      },
      {
        label: 'Actions',
        value: 'action',
      },
      {
        label: 'Data (JSON Formatted)',
        value: 'data',
      },
    ];

    const workSheetName = 'System Logs';
    const sheetHeaderTitle = 'System Logs Report';

    return {
      data,
      fields,
      startDate,
      endDate,
      workSheetName,
      sheetHeaderTitle,
    };
  }
}
