import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { CreateMeterDto } from '../meter/dto/create-meter.dto';
import { OrganizationDocument } from '../organization/entities/organization.schema';
import { CreateMeterConsumptionDto } from './dto/create-meter-consumption.dto';
import {
  MeterConsumption,
  MeterConsumptionDocument,
} from './entities/meter-consumption.schema';

export interface IMeterConsumption {
  create(dto: CreateMeterConsumptionDto);
  findMeterConsumption(devEUI: string, startDate: Date, endDate?: Date);
  generateReports(startDate: Date, endDate: Date);
  seed(
    organization: OrganizationDocument,
    data: CreateMeterConsumptionDto[],
    meterData: CreateMeterDto[],
  );
}

@Injectable()
export class MeterConsumptionRepository implements IMeterConsumption {
  constructor(
    @InjectModel(MeterConsumption.name)
    private meterConsumptionModel: Model<MeterConsumptionDocument>,
  ) {}

  async create(dto: CreateMeterConsumptionDto) {
    return await this.meterConsumptionModel.create(dto);
  }

  findMeterConsumption(devEUI: string, startDate: Date, endDate?: Date) {
    const consumed_at: { $gte: Date; $lt?: Date } = { $gte: startDate };

    if (endDate) {
      consumed_at.$lt = endDate;
    }

    return this.meterConsumptionModel
      .find({
        dev_eui: devEUI,
        consumed_at,
        last_uplink: true,
      })
      .sort({ consumed_at: 1 });
  }

  async generateReports(startDate: Date, endDate: Date) {
    let previousDate: moment.Moment | string = moment(startDate).subtract(
      1,
      'days',
    );

    const format = previousDate.creationData().format.toString();
    previousDate = previousDate.format(format); // Formatted string

    const consumptions = await this.meterConsumptionModel.aggregate([
      {
        $lookup: {
          from: 'meters',
          localField: 'dev_eui',
          foreignField: 'dev_eui',
          as: 'meter',
        },
      },
      {
        $addFields: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$consumed_at',
            },
          },
          meter: { $arrayElemAt: ['$meter', 0] },
        },
      },
      {
        $match: {
          date: {
            $gte: previousDate,
            $lte: endDate,
          },
        },
      },
    ]);

    const data = consumptions
      .map((consumption, index) => {
        if (consumption.date === previousDate) {
          return null;
        }

        let volume_cubic_meter = (() => {
          if (index > 0) {
            const previousCumulativeFlow =
              consumptions[index - 1]?.cumulative_flow || 0;

            return consumption.cumulative_flow - previousCumulativeFlow;
          }

          return 0;
        })();

        volume_cubic_meter /= 1000;
        return { ...consumption, volume_cubic_meter };
      })
      .filter(Boolean); // Remove null items

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
        label: 'volume(cu.m)',
        value: 'volume_cubic_meter',
      },
    ];

    return { data, fields };
  }

  seed(organization: OrganizationDocument, data: CreateMeterConsumptionDto[]) {
    return data.map(async (val) => {
      return this.meterConsumptionModel.findOneAndUpdate(
        {
          dev_eui: val.dev_eui,
          consumed_at: val.consumed_at,
        },
        {
          ...val,
        },
        { upsert: true, new: true },
      );
    });
  }
}
