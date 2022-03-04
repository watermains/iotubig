import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from './entities/log.entity';

export enum Action {
  open = 'open valve',
  close = 'close valve',
  reload = 'reload',
  deduct = 'deduct',
}

@Injectable()
export class LogService {
  constructor(@InjectModel(Log.name) private log: Model<LogDocument>) {}

  async findAll(): Promise<Log[]> {
    return await this.log.find().limit(50);
  }

  async create(meter_name: string, action: Action) {
    await this.log.create({
      meter_name,
      action,
    });
  }
}
