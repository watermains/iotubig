import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meter, MeterDocument } from 'src/module/meter/entities/meter.schema';

@Injectable()
export class ValidateMeterMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Meter.name) private readonly meterModel: Model<MeterDocument>,
  ) {}

  async use(req: any, res: any, next: () => void) {
    const data = [req.body.dev_eui, req.query.devEUI, req.params.devEUI];
    const valid = data.filter((val) => val);

    const devEui = valid.reduce((prev, curr) => prev + curr);

    console.log(valid.length + ' ' + devEui);
    if (!devEui || devEui == '' || valid.length > 1) {
      throw new BadRequestException();
    }

    const meter = await this.meterModel.findOne({ dev_eui: devEui });
    if (meter) {
      next();
      return;
    }
    res.json({
      statusCode: 204,
      error: 'Invalid meter',
    });
  }
}
