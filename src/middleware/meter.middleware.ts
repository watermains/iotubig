import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meter, MeterDocument } from 'src/module/meter/entities/meter.schema';

@Injectable()
export class ValidateMeterMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Meter.name) private readonly meterModel: Model<MeterDocument>,
  ) {}

  async use(req: any, res: any, next: () => void) {
    let devEui = req.body.dev_eui;
    if (!devEui) {
      devEui = req.query.devEUI;
    }
    if (!devEui) {
      return false;
    }

    const meter = await this.meterModel.findOne({ dev_eui: devEui });
    if (meter) {
      next();
    }
    res.json({
      statusCode: 204,
      error: 'Invalid meter',
    });
  }
}
