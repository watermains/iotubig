import { Injectable } from '@nestjs/common';
import { Log } from './entities/log.schema';
import { LogRepository } from './log.repository';

export enum Action {
  open = 'open valve',
  close = 'close valve',
  reload = 'reload',
  deduct = 'deduct',
}

export class LogData {
  meter_name: string;
  action: string;
  data: string;
  created_by: string;
  organization_id: string;
}

@Injectable()
export class LogService {
  constructor(private readonly repo: LogRepository) {}

  async findAll(organization_id: string): Promise<Log[]> {
    return await this.repo.findLogs(organization_id);
  }

  async create(data: LogData) {
    return await this.repo.createLog(data);
  }

  generateReports(
    startDate: Date,
    endDate: Date,
    organization_id: string,
    utcOffset: number,
  ) {
    return this.repo.generateReports(
      startDate,
      endDate,
      organization_id,
      utcOffset,
    );
  }
}
