import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from './entities/log.schema';
import { LogData } from './log.service';

export interface ILog {
  findLogs(organization_id: string);
  createLog(data: LogData);
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
}
